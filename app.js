// ==========================================================================
// Key Detector - Complete Game Logic with Learning Modes & Synth Engine
// ==========================================================================

// --- 音階・キーデータの定義 ---
const KEYS = {
  easy: [
    { name: 'C Major', root: 48, type: 'major', noteName: 'C' },
    { name: 'G Major', root: 43, type: 'major', noteName: 'G' },
    { name: 'F Major', root: 41, type: 'major', noteName: 'F' },
    { name: 'A Minor', root: 45, type: 'minor', noteName: 'A' },
    { name: 'E Minor', root: 40, type: 'minor', noteName: 'E' },
    { name: 'D Minor', root: 50, type: 'minor', noteName: 'D' }
  ],
  medium: [
    { name: 'D Major', root: 50, type: 'major', noteName: 'D' },
    { name: 'A Major', root: 45, type: 'major', noteName: 'A' },
    { name: 'Bb Major', root: 46, type: 'major', noteName: 'Bb' },
    { name: 'Eb Major', root: 51, type: 'major', noteName: 'Eb' },
    { name: 'B Minor', root: 47, type: 'minor', noteName: 'B' },
    { name: 'G Minor', root: 43, type: 'minor', noteName: 'G' },
    { name: 'F# Minor', root: 42, type: 'minor', noteName: 'F#' },
    { name: 'C Minor', root: 48, type: 'minor', noteName: 'C' }
  ],
  hard: [
    { name: 'E Major', root: 40, type: 'major', noteName: 'E' },
    { name: 'Ab Major', root: 44, type: 'major', noteName: 'Ab' },
    { name: 'Db Major', root: 49, type: 'major', noteName: 'Db' },
    { name: 'B Major', root: 47, type: 'major', noteName: 'B' },
    { name: 'F# Major', root: 42, type: 'major', noteName: 'F#' },
    { name: 'C# Minor', root: 49, type: 'minor', noteName: 'C#' },
    { name: 'G# Minor', root: 44, type: 'minor', noteName: 'G#' },
    { name: 'F Minor', root: 41, type: 'minor', noteName: 'F' },
    { name: 'Bb Minor', root: 46, type: 'minor', noteName: 'Bb' }
  ]
};

// 鍵盤オフセットと音名のマッピング (Cから始まる半音単位)
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C"];

// --- ゲーム状態管理 ---
let activeTab = 'learn'; // 'learn' | 'challenge'
let activeStep = 'resolve'; // 'resolve' | 'find-tonic'

let currentDifficulty = 'easy';
let correctKey = null;
let score = 0;
let streak = 0;
let isPlaying = false;
let isAnswered = false;

// Web Audio APIの参照保持用
let activeOscillators = [];
let activeGainNodes = [];
let playbackTimeoutId = null;
let loopIntervalId = null;

// ステップ1 (解決クイズ) の状態
let step1IsResolved = true; // 正解が「解決」か「未解決」か

// ステップ2 (主音を探せ) の状態
let step2SelectedOffset = null; // ユーザーが鍵盤で選択した半音オフセット

// --- Web Audio API 初期化とエラーハンドリング ---
let audioCtx = null;

function getAudioContext() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      console.log("AudioContext created. State:", audioCtx.state);
    }
    
    // 一部のブラウザ対策：状態が suspended の場合は明示的に resume
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().then(() => {
        console.log("AudioContext resumed successfully. State:", audioCtx.state);
      }).catch(err => {
        console.error("Failed to resume AudioContext:", err);
        showSystemError("音声エンジンの有効化に失敗しました。画面をクリックしてからもう一度お試しください。");
      });
    }
    return audioCtx;
  } catch (e) {
    console.error("AudioContext initialization failed:", e);
    showSystemError("お使いのブラウザは音声再生に対応していないか、制限されています。");
    return null;
  }
}

// 画面にシステムエラーを表示するデバッグ補助関数
function showSystemError(message) {
  const msgEl = document.getElementById('feedback-message');
  const panelEl = document.getElementById('feedback-panel');
  if (msgEl && panelEl) {
    panelEl.className = 'feedback-panel error';
    msgEl.innerHTML = `<span style="color:var(--accent-error)">⚠️ <strong>音声エラー:</strong> ${message}</span>`;
  }
}

// MIDIノート番号から周波数へ変換
function midiNoteToFreq(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

// 柔らかなオルガン/シンセ風の音を鳴らす
function playTone(freq, startTime, duration, type = 'triangle', volume = 0.12) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // startTime が過去の時刻にならないように現在時刻でクランプする（ブラウザの再生遅延対策）
  const start = Math.max(startTime, now);
  const end = start + duration;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);

  // ローパスフィルターで高域をカットし、温かみのある丸い音にする
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(700, start);

  // 完全に安全なボリューム・フェード設定
  gainNode.gain.cancelScheduledValues(start);
  gainNode.gain.setValueAtTime(0, start);
  // アタック：0.08秒かけて目標の音量へ
  gainNode.gain.linearRampToValueAtTime(volume, start + 0.08); 
  // リリースの直前まで音量をキープ
  gainNode.gain.setValueAtTime(volume, Math.max(start + 0.08, end - 0.12));
  // リリースの終点：無音にする（指数カーブで0に近づけるため、0.0001などの微小値を指定）
  gainNode.gain.exponentialRampToValueAtTime(0.0001, end);

  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(start);
  osc.stop(end);

  activeOscillators.push(osc);
  activeGainNodes.push(gainNode);
}

// 複数の音（コード）を同時に鳴らす
function playChord(notes, startTime, duration, volumeFactor = 1) {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  const now = ctx.currentTime;
  const start = Math.max(startTime, now);

  notes.forEach(note => {
    const freq = midiNoteToFreq(note);
    playTone(freq, start, duration, 'triangle', 0.07 * volumeFactor);
    // 重厚なベース音をサイン波で重ねる
    if (note === notes[0]) {
      playTone(midiNoteToFreq(note - 12), start, duration, 'sine', 0.14 * volumeFactor);
    }
  });
}

// 音声再生をすべて停止する
function stopAllAudio() {
  isPlaying = false;
  
  // UIクラスのリセット
  document.getElementById('btn-play-resolve').classList.remove('playing');
  document.getElementById('btn-play-loop').classList.remove('playing');
  document.getElementById('btn-play-challenge').classList.remove('playing');
  
  document.querySelector('#btn-play-resolve .play-icon').textContent = '▶';
  document.querySelector('#btn-play-loop .play-icon').textContent = '▶';
  document.querySelector('#btn-play-challenge .play-icon').textContent = '▶';

  // ループ用タイマーのクリア
  if (loopIntervalId) {
    clearInterval(loopIntervalId);
    loopIntervalId = null;
  }
  if (playbackTimeoutId) {
    clearTimeout(playbackTimeoutId);
    playbackTimeoutId = null;
  }

  // 再生中のGainNodeをフェードアウト
  activeGainNodes.forEach(gainNode => {
    try {
      if (audioCtx) {
        gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      }
    } catch (e) {}
  });

  setTimeout(() => {
    activeOscillators.forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    activeOscillators = [];
    activeGainNodes = [];
  }, 100);
}

// ==========================================================================
// ラーニングモード - ステップ1: 解決・もやもやクイズ
// ==========================================================================

function initResolveQuestion() {
  stopAllAudio();
  isAnswered = false;

  const feedbackPanel = document.getElementById('feedback-panel');
  feedbackPanel.className = 'feedback-panel';
  document.getElementById('feedback-message').textContent = '再生ボタンを押して、最後のコードの余韻を聴いてみよう！';

  // 選択ボタンのスタイルリセット
  document.getElementById('choice-resolved').className = 'resolve-choice-btn';
  document.getElementById('choice-unresolved').className = 'resolve-choice-btn';

  // イージーのプールからランダムにキーを選択
  const pool = KEYS.easy;
  correctKey = pool[Math.floor(Math.random() * pool.length)];

  // 50%の確率で解決(true)か未解決(false)かを決定
  step1IsResolved = Math.random() >= 0.5;
}

function playResolveSequence() {
  if (isPlaying) {
    stopAllAudio();
    document.getElementById('status-resolve').textContent = '再生を停止しました';
    return;
  }

  const ctx = getAudioContext();
  const now = ctx.currentTime;
  isPlaying = true;

  document.getElementById('btn-play-resolve').classList.add('playing');
  document.querySelector('#btn-play-resolve .play-icon').textContent = '■';
  document.getElementById('status-resolve').textContent = '再生中... 最後のコードに注目！';

  const R = correctKey.root;
  let chordSequence = [];

  if (correctKey.type === 'major') {
    // 解決：I -> IV -> V -> I  / 未解決：I -> IV -> V -> V
    chordSequence = [
      { notes: [R, R + 4, R + 7, R + 12], duration: 1.2 },     // I
      { notes: [R + 5, R + 9, R + 12, R + 17], duration: 1.2 }, // IV
      { notes: [R + 7, R + 11, R + 14, R + 19], duration: 1.2 }, // V
      step1IsResolved 
        ? { notes: [R, R + 4, R + 7, R + 12], duration: 1.8 }   // I (解決)
        : { notes: [R + 7, R + 11, R + 14, R + 19], duration: 1.8 } // V (もやもや未解決)
    ];
  } else {
    // 解決：i -> iv -> V -> i  / 未解決：i -> iv -> V -> V
    chordSequence = [
      { notes: [R, R + 3, R + 7, R + 12], duration: 1.2 },     // i
      { notes: [R + 5, R + 8, R + 12, R + 17], duration: 1.2 }, // iv
      { notes: [R + 7, R + 11, R + 14, R + 19], duration: 1.2 }, // V
      step1IsResolved 
        ? { notes: [R, R + 3, R + 7, R + 12], duration: 1.8 }   // i (解決)
        : { notes: [R + 7, R + 11, R + 14, R + 19], duration: 1.8 } // V (もやもや未解決)
    ];
  }

  let timeAccumulator = 0;
  chordSequence.forEach((chord) => {
    playChord(chord.notes, now + timeAccumulator, chord.duration);
    timeAccumulator += 1.15;
  });

  playbackTimeoutId = setTimeout(() => {
    isPlaying = false;
    document.getElementById('btn-play-resolve').classList.remove('playing');
    document.querySelector('#btn-play-resolve .play-icon').textContent = '▶';
    document.getElementById('status-resolve').textContent = 'どう聞こえましたか？答えを選んでください。';
  }, timeAccumulator * 1000 + 400);
}

function submitResolveAnswer(userChoice) {
  if (isAnswered) return;
  isAnswered = true;
  stopAllAudio();

  const feedbackPanel = document.getElementById('feedback-panel');
  const feedbackMessage = document.getElementById('feedback-message');
  
  const correctBtn = step1IsResolved ? document.getElementById('choice-resolved') : document.getElementById('choice-unresolved');
  const incorrectBtn = step1IsResolved ? document.getElementById('choice-unresolved') : document.getElementById('choice-resolved');

  if (userChoice === step1IsResolved) {
    score += 10;
    streak += 1;
    correctBtn.classList.add('correct');
    feedbackPanel.className = 'feedback-panel success';
    feedbackMessage.innerHTML = `🎉 <strong>正解！</strong> (今回のキー: <strong>${correctKey.name}</strong>)<br>素晴らしい！最後は ${step1IsResolved ? '綺麗に解決（トニックに着地）していました！' : 'もやもやして終わっていませんでした（ドミナントでストップ）。'}`;
    
    document.getElementById('score-val').textContent = score;
    document.getElementById('streak-val').textContent = streak;

    setTimeout(() => {
      initResolveQuestion();
    }, 2800);
  } else {
    streak = 0;
    incorrectBtn.classList.add('incorrect');
    correctBtn.classList.add('correct');
    feedbackPanel.className = 'feedback-panel error';
    feedbackMessage.innerHTML = `😢 <strong>残念！</strong> (今回のキー: <strong>${correctKey.name}</strong>)<br>最後は ${step1IsResolved ? '「すっきり（解決）」' : '「もやもや（未解決）」'} でした。もう一度音階の落ち着き具合を意識してみましょう。`;
    
    document.getElementById('streak-val').textContent = streak;

    setTimeout(() => {
      initResolveQuestion();
    }, 3800);
  }
}


// ==========================================================================
// ラーニングモード - ステップ2: 主音を探せ！（鍵盤UI）
// ==========================================================================

function initFindTonicQuestion() {
  stopAllAudio();
  isAnswered = false;
  step2SelectedOffset = null;
  
  // UIリセット
  document.getElementById('selected-note-name').textContent = 'なし';
  document.getElementById('btn-submit-tonic').disabled = true;
  
  const feedbackPanel = document.getElementById('feedback-panel');
  feedbackPanel.className = 'feedback-panel';
  feedbackMessage.textContent = '伴奏ループを流しながら、鍵盤で一番しっくりくる「主音」を鳴らして探そう！';

  // 鍵盤のアクティブスタイルリセット
  document.querySelectorAll('.key').forEach(key => key.classList.remove('active'));

  // Easyのプールからランダムにキーを選択
  const pool = KEYS.easy;
  correctKey = pool[Math.floor(Math.random() * pool.length)];
}

// 伴奏のループ再生・停止
function toggleTonicLoop() {
  if (isPlaying) {
    stopAllAudio();
    document.getElementById('status-loop').textContent = 'ループ再生を停止しました';
    return;
  }

  const ctx = getAudioContext();
  isPlaying = true;

  document.getElementById('btn-play-loop').classList.add('playing');
  document.querySelector('#btn-play-loop .play-icon').textContent = '■';
  document.getElementById('status-loop').textContent = '伴奏が流れています。鍵盤を弾いてみよう！';

  const R = correctKey.root;
  let chords = [];

  if (correctKey.type === 'major') {
    chords = [
      { notes: [R, R + 4, R + 7, R + 12], duration: 1.1 },
      { notes: [R + 5, R + 9, R + 12], duration: 1.1 },
      { notes: [R + 7, R + 11, R + 14], duration: 1.1 },
      { notes: [R, R + 4, R + 7, R + 12], duration: 1.1 }
    ];
  } else {
    chords = [
      { notes: [R, R + 3, R + 7, R + 12], duration: 1.1 },
      { notes: [R + 5, R + 8, R + 12], duration: 1.1 },
      { notes: [R + 7, R + 11, R + 14], duration: 1.1 },
      { notes: [R, R + 3, R + 7, R + 12], duration: 1.1 }
    ];
  }

  const playOnce = () => {
    const now = ctx.currentTime;
    chords.forEach((chord, index) => {
      // 伴奏の音量を少し下げて、ユーザーが弾く鍵盤の音を聴きやすくする
      playChord(chord.notes, now + index * 1.1, chord.duration, 0.7);
    });
  };

  playOnce();
  // 4.4秒 (1.1s * 4) ごとにループ
  loopIntervalId = setInterval(playOnce, 4400);
}

// 鍵盤キーがタップされたときの処理
function handleKeyTrigger(keyElement) {
  const offset = parseInt(keyElement.dataset.midiOffset, 10);
  const noteName = keyElement.dataset.note;
  
  // 鍵盤のアクティブ表示切り替え
  document.querySelectorAll('.key').forEach(k => k.classList.remove('active'));
  keyElement.classList.add('active');

  // 音名を画面表示
  // C2(12)は「C」として画面に表示する
  const displayNoteName = noteName.replace('2', '');
  document.getElementById('selected-note-name').textContent = displayNoteName;
  step2SelectedOffset = offset;
  document.getElementById('btn-submit-tonic').disabled = false;

  // 鍵盤の音を鳴らす（ミドルC=60基準）
  const baseMidiNote = 60 + offset; 
  const freq = midiNoteToFreq(baseMidiNote);
  
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // ユーザーの弾く音はサイン波で綺麗にハッキリ鳴らす
  playTone(freq, now, 0.8, 'sine', 0.22);
}

// 主音の解答判定
function submitTonicAnswer() {
  if (isAnswered || step2SelectedOffset === null) return;
  isAnswered = true;
  
  stopAllAudio();

  const feedbackPanel = document.getElementById('feedback-panel');
  const feedbackMessage = document.getElementById('feedback-message');
  
  // 正解の音階名（例: G, Cなど）
  const correctNoteName = correctKey.noteName;
  // ユーザーが選択した音階名
  const userNoteName = NOTE_NAMES[step2SelectedOffset];

  // 正誤判定（オクターブの違いを吸収するため音名で判定）
  if (userNoteName === correctNoteName) {
    score += 15; // 主音探しは少し難しいため得点を高めに設定
    streak += 1;
    feedbackPanel.className = 'feedback-panel success';
    feedbackMessage.innerHTML = `🎉 <strong>正解！</strong> (今回のキー: <strong>${correctKey.name}</strong> / 主音: <strong>${correctNoteName}</strong>)<br>伴奏に最も美しく解決して馴染む音を完璧に見つけ出せました！`;
    
    document.getElementById('score-val').textContent = score;
    document.getElementById('streak-val').textContent = streak;

    setTimeout(() => {
      initFindTonicQuestion();
    }, 2800);
  } else {
    streak = 0;
    feedbackPanel.className = 'feedback-panel error';
    feedbackMessage.innerHTML = `😢 <strong>残念！</strong><br>あなたが選んだ音は <strong>${userNoteName}</strong> でした。<br>この曲（${correctKey.name}）の正しい主音は <strong>${correctNoteName}</strong> です。主音を鳴らした時の「スーッと馴染む感覚」を覚えておきましょう。`;
    
    document.getElementById('streak-val').textContent = streak;

    // 正解の鍵盤を点滅させてユーザーに教える
    highlightCorrectKey(correctNoteName);

    setTimeout(() => {
      initFindTonicQuestion();
    }, 3800);
  }
}

// 正解の鍵盤をハイライト（点滅）する
function highlightCorrectKey(correctNoteName) {
  document.querySelectorAll('.key').forEach(key => {
    // data-noteのオクターブ表記（C2など）を考慮して一致するか確認
    const note = key.dataset.note.replace('2', '');
    if (note === correctNoteName) {
      key.classList.add('active');
    }
  });
}

// ==========================================================================
// チャレンジモード - 従来のキー当てクイズ
// ==========================================================================

function initChallengeQuestion() {
  stopAllAudio();
  isAnswered = false;
  document.getElementById('btn-hint').disabled = true;
  
  const feedbackPanel = document.getElementById('feedback-panel');
  feedbackPanel.className = 'feedback-panel';
  document.getElementById('feedback-message').textContent = '再生ボタンを押してコードを聴き、キーを当てましょう！';

  const pool = KEYS[currentDifficulty];
  correctKey = pool[Math.floor(Math.random() * pool.length)];

  // 選択肢の生成
  let choices = [correctKey];
  const otherKeys = pool.filter(k => k.name !== correctKey.name);
  const shuffledOthers = shuffleArray(otherKeys);
  for (let i = 0; i < Math.min(3, shuffledOthers.length); i++) {
    choices.push(shuffledOthers[i]);
  }
  
  choices = shuffleArray(choices);

  const choicesGrid = document.getElementById('choices-grid');
  choicesGrid.innerHTML = '';
  
  choices.forEach(key => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = key.name;
    btn.addEventListener('click', () => submitChallengeAnswer(key.name, btn));
    choicesGrid.appendChild(btn);
  });
}

function playChallengeSequence() {
  if (isPlaying) {
    stopAllAudio();
    document.getElementById('status-challenge').textContent = '再生を停止しました';
    return;
  }

  const ctx = getAudioContext();
  const now = ctx.currentTime;
  isPlaying = true;

  document.getElementById('btn-play-challenge').classList.add('playing');
  document.querySelector('#btn-play-challenge .play-icon').textContent = '■';
  document.getElementById('status-challenge').textContent = '試聴中... キーを推測しよう';
  document.getElementById('btn-hint').disabled = false;

  const R = correctKey.root;
  let chordSequence = [];

  if (correctKey.type === 'major') {
    chordSequence = [
      { notes: [R, R + 4, R + 7, R + 12], duration: 1.3 },
      { notes: [R + 5, R + 9, R + 12, R + 17], duration: 1.3 },
      { notes: [R + 7, R + 11, R + 14, R + 19], duration: 1.3 },
      { notes: [R, R + 4, R + 7, R + 12], duration: 1.8 }
    ];
  } else {
    chordSequence = [
      { notes: [R, R + 3, R + 7, R + 12], duration: 1.3 },
      { notes: [R + 5, R + 8, R + 12, R + 17], duration: 1.3 },
      { notes: [R + 7, R + 11, R + 14, R + 19], duration: 1.3 },
      { notes: [R, R + 3, R + 7, R + 12], duration: 1.8 }
    ];
  }

  let timeAccumulator = 0;
  chordSequence.forEach((chord) => {
    playChord(chord.notes, now + timeAccumulator, chord.duration);
    timeAccumulator += 1.25;
  });

  playbackTimeoutId = setTimeout(() => {
    isPlaying = false;
    document.getElementById('btn-play-challenge').classList.remove('playing');
    document.querySelector('#btn-play-challenge .play-icon').textContent = '▶';
    document.getElementById('status-challenge').textContent = '正解だと思うキーを選択してください';
  }, timeAccumulator * 1000 + 400);
}

function playChallengeHint() {
  if (!correctKey) return;
  stopAllAudio();
  
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // 主音をオクターブ上のサイン波で再生
  const freq = midiNoteToFreq(correctKey.root + 12);
  isPlaying = true;
  
  document.getElementById('btn-play-challenge').classList.add('playing');
  document.getElementById('status-challenge').textContent = 'ヒント：主音（ルート音）を再生中...';
  
  playTone(freq, now, 1.6, 'sine', 0.25);
  
  playbackTimeoutId = setTimeout(() => {
    isPlaying = false;
    document.getElementById('btn-play-challenge').classList.remove('playing');
    document.getElementById('status-challenge').textContent = '主音のヒントを参考にキーを選ぼう';
  }, 1700);
}

function submitChallengeAnswer(selectedKeyName, selectedButton) {
  if (isAnswered) return;
  isAnswered = true;
  stopAllAudio();

  const feedbackPanel = document.getElementById('feedback-panel');
  const feedbackMessage = document.getElementById('feedback-message');
  const allButtons = document.querySelectorAll('.choice-btn');

  if (selectedKeyName === correctKey.name) {
    score += 10;
    streak += 1;
    selectedButton.classList.add('correct');
    feedbackPanel.className = 'feedback-panel success';
    feedbackMessage.innerHTML = `🎉 <strong>正解！</strong> キーは <strong>${correctKey.name}</strong> です！<br>見事な相対音感です！`;
    
    document.getElementById('score-val').textContent = score;
    document.getElementById('streak-val').textContent = streak;

    setTimeout(() => {
      initChallengeQuestion();
    }, 2500);
  } else {
    streak = 0;
    selectedButton.classList.add('incorrect');
    feedbackPanel.className = 'feedback-panel error';
    
    // 正解を提示
    allButtons.forEach(btn => {
      if (btn.textContent === correctKey.name) {
        btn.classList.add('correct');
      }
    });

    feedbackMessage.innerHTML = `😢 <strong>残念！</strong> 正解は <strong>${correctKey.name}</strong> でした。<br>主音とコードの響きをもう一度体に覚え込ませましょう。`;
    document.getElementById('streak-val').textContent = streak;

    setTimeout(() => {
      initChallengeQuestion();
    }, 3500);
  }
}

// --- 配列シャッフルユーティリティ ---
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ==========================================================================
// タブ・UI制御イベント初期化
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // モードタブ制御
  const tabLearn = document.getElementById('tab-learn');
  const tabChallenge = document.getElementById('tab-challenge');
  const learnCard = document.getElementById('learn-card');
  const challengeCard = document.getElementById('challenge-card');

  tabLearn.addEventListener('click', () => {
    if (activeTab === 'learn') return;
    stopAllAudio();
    activeTab = 'learn';
    tabLearn.classList.add('active');
    tabChallenge.classList.remove('active');
    learnCard.style.display = 'flex';
    challengeCard.style.display = 'none';
    
    // ラーニングモードの初期化
    if (activeStep === 'resolve') {
      initResolveQuestion();
    } else {
      initFindTonicQuestion();
    }
  });

  tabChallenge.addEventListener('click', () => {
    if (activeTab === 'challenge') return;
    stopAllAudio();
    activeTab = 'challenge';
    tabChallenge.classList.add('active');
    tabLearn.classList.remove('active');
    challengeCard.style.display = 'flex';
    learnCard.style.display = 'none';
    
    // チャレンジモードの初期化
    initChallengeQuestion();
  });

  // ラーニングモードのステップ制御
  const stepBtnResolve = document.getElementById('step-btn-resolve');
  const stepBtnFindTonic = document.getElementById('step-btn-find-tonic');
  const contentResolve = document.getElementById('content-resolve');
  const contentFindTonic = document.getElementById('content-find-tonic');

  stepBtnResolve.addEventListener('click', () => {
    if (activeStep === 'resolve') return;
    stopAllAudio();
    activeStep = 'resolve';
    stepBtnResolve.classList.add('active');
    stepBtnFindTonic.classList.remove('active');
    contentResolve.classList.add('active');
    contentFindTonic.classList.remove('active');
    
    initResolveQuestion();
  });

  stepBtnFindTonic.addEventListener('click', () => {
    if (activeStep === 'find-tonic') return;
    stopAllAudio();
    activeStep = 'find-tonic';
    stepBtnFindTonic.classList.add('active');
    stepBtnResolve.classList.remove('active');
    contentFindTonic.classList.add('active');
    contentResolve.classList.remove('active');
    
    initFindTonicQuestion();
  });

  // --- ステップ1（解決）のイベントリスナー ---
  document.getElementById('btn-play-resolve').addEventListener('click', playResolveSequence);
  document.getElementById('choice-resolved').addEventListener('click', () => submitResolveAnswer(true));
  document.getElementById('choice-unresolved').addEventListener('click', () => submitResolveAnswer(false));

  // --- ステップ2（主音探し）のイベントリスナー ---
  document.getElementById('btn-play-loop').addEventListener('click', toggleTonicLoop);
  document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', () => handleKeyTrigger(key));
  });
  document.getElementById('btn-submit-tonic').addEventListener('click', submitTonicAnswer);

  // --- チャレンジモードのイベントリスナー ---
  document.getElementById('btn-play-challenge').addEventListener('click', () => {
    if (correctKey) playChallengeSequence();
  });
  document.getElementById('btn-hint').addEventListener('click', playChallengeHint);

  const diffButtons = document.querySelectorAll('.diff-btn');
  diffButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      diffButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDifficulty = btn.dataset.diff;
      initChallengeQuestion();
    });
  });

  // 初回ゲーム開始時はラーニングモード（ステップ1）で初期化
  initResolveQuestion();
});
