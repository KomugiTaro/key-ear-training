// ==========================================================================
// Key Detector - Game Logic with Note-by-Note RPG Battle Mode
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

// 鍵盤・指板オフセットと音名のマッピング
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C"];

// ギター弦のフレットノート定義
const FRET_NOTES = {
  1: [
    { fret: 0, note: 64, name: 'E' },
    { fret: 1, note: 65, name: 'F' },
    { fret: 2, note: 66, name: 'F#' },
    { fret: 3, note: 67, name: 'G' },
    { fret: 4, note: 68, name: 'G#' },
    { fret: 5, note: 69, name: 'A' }
  ],
  2: [
    { fret: 0, note: 59, name: 'B' },
    { fret: 1, note: 60, name: 'C' },
    { fret: 2, note: 61, name: 'C#' },
    { fret: 3, note: 62, name: 'D' },
    { fret: 4, note: 63, name: 'D#' },
    { fret: 5, note: 64, name: 'E' }
  ],
  3: [
    { fret: 0, note: 55, name: 'G' },
    { fret: 1, note: 56, name: 'G#' },
    { fret: 2, note: 57, name: 'A' },
    { fret: 3, note: 58, name: 'A#' },
    { fret: 4, note: 59, name: 'B' },
    { fret: 5, note: 60, name: 'C' }
  ],
  4: [
    { fret: 0, note: 50, name: 'D' },
    { fret: 1, note: 51, name: 'D#' },
    { fret: 2, note: 52, name: 'E' },
    { fret: 3, note: 53, name: 'F' },
    { fret: 4, note: 54, name: 'F#' },
    { fret: 5, note: 55, name: 'G' }
  ],
  5: [
    { fret: 0, note: 45, name: 'A' },
    { fret: 1, note: 46, name: 'A#' },
    { fret: 2, note: 47, name: 'B' },
    { fret: 3, note: 48, name: 'C' },
    { fret: 4, note: 49, name: 'C#' },
    { fret: 5, note: 50, name: 'D' }
  ],
  6: [
    { fret: 0, note: 40, name: 'E' },
    { fret: 1, note: 41, name: 'F' },
    { fret: 2, note: 42, name: 'F#' },
    { fret: 3, note: 43, name: 'G' },
    { fret: 4, note: 44, name: 'G#' },
    { fret: 5, note: 45, name: 'A' }
  ]
};

// 定番ベースライン進行パターン (キー情報を含む)
const BASELINE_PROGRESSIONS = [
  {
    name: 'C -> G -> Am -> F (王道ポップ進行)',
    keyName: 'C Major',
    sequence: [
      { name: 'C', string: 5, fret: 3 },
      { name: 'G', string: 6, fret: 3 },
      { name: 'A', string: 6, fret: 5 },
      { name: 'F', string: 6, fret: 1 }
    ],
    chords: [
      [48, 52, 55, 60], // C
      [43, 47, 50, 55], // G
      [45, 48, 52, 57], // Am
      [41, 45, 48, 53]  // F
    ]
  },
  {
    name: 'F -> G -> Em -> Am (小室進行)',
    keyName: 'C Major',
    sequence: [
      { name: 'F', string: 6, fret: 1 },
      { name: 'G', string: 6, fret: 3 },
      { name: 'E', string: 6, fret: 0 },
      { name: 'A', string: 6, fret: 5 }
    ],
    chords: [
      [41, 45, 48, 53], // F
      [43, 47, 50, 55], // G
      [40, 43, 47, 52], // Em
      [45, 48, 52, 57]  // Am
    ]
  },
  {
    name: 'C -> F -> G -> C (シンプルスリーコード)',
    keyName: 'C Major',
    sequence: [
      { name: 'C', string: 5, fret: 3 },
      { name: 'F', string: 6, fret: 1 },
      { name: 'G', string: 6, fret: 3 },
      { name: 'C', string: 5, fret: 3 }
    ],
    chords: [
      [48, 52, 55, 60], // C
      [41, 45, 48, 53], // F
      [43, 47, 50, 55], // G
      [48, 52, 55, 60]  // C
    ]
  },
  {
    name: 'Am -> Dm -> G -> C (ジャズ・ターンバック風)',
    keyName: 'C Major',
    sequence: [
      { name: 'A', string: 6, fret: 5 },
      { name: 'D', string: 5, fret: 5 },
      { name: 'G', string: 6, fret: 3 },
      { name: 'C', string: 5, fret: 3 }
    ],
    chords: [
      [45, 48, 52, 57], // Am
      [50, 53, 57, 62], // Dm
      [43, 47, 50, 55], // G
      [48, 52, 55, 60]  // C
    ]
  }
];

// モンスター図鑑
const MONSTER_TEMPLATES = [
  { name: '音感スライム', color: '#9d4edd', maxHp: 100 },
  { name: 'チューニングゴブリン', color: '#00f5d4', maxHp: 120 },
  { name: 'メロディゴースト', color: '#00f2fe', maxHp: 150 },
  { name: 'リズムオーク', color: '#ff5470', maxHp: 180 },
  { name: 'コードドラゴン (BOSS)', color: '#ff007f', maxHp: 250 }
];

// --- ゲーム状態管理 ---
let activeTab = 'learn';
let activeStep = 'resolve';

let currentDifficulty = 'easy';
let correctKey = null;
let score = 0;
let streak = 0;
let isPlaying = false;
let isAnswered = false;

// 各モードの状態
let step1IsResolved = true;
let step2SelectedOffset = null;

// Web Audio APIの参照保持用
let activeOscillators = [];
let activeGainNodes = [];
let playbackTimeoutId = null;
let loopIntervalId = null;
let audioCtx = null;

// ⚔️ RPGモード専用のゲーム変数とセーブデータ定義
const SAVE_KEY = 'key_detector_rpg_save';
let saveData = {
  gold: 0,
  highScore: 0,
  upgrades: {
    hp: 1,      // 最大HP強化レベル
    atk: 1,     // 攻撃力強化レベル
    time: 1     // 制限時間強化レベル
  }
};

let runData = {
  currentHp: 100,
  maxHp: 100,
  goldGained: 0,
  tempUpgrades: {
    bonusAtk: 0,  // パワーアップカードで得た追加攻撃力倍率 (+0.25など)
    bonusTime: 0  // パワーアップカードで得た追加制限時間秒 (+4など)
  }
};

let monsterLevel = 1;
let monsterMaxHP = 100;
let monsterCurrentHP = 100;
let comboCount = 0;
let battleTimeLeft = 18;
let battleTimerIntervalId = null;

// 新ルール用変数
let currentProgression = null; // 現在のコード進行データ
let baselineRound = 1;         // 現在当てるべき拍 (1〜4音目)
let userBaselineInput = [];   // ユーザーの正解した履歴の記録
let isKeyQuizMode = false;     // キー当てクイズ中のフラグ

// ご褒美演奏用アドリブ状態
let rewardPlayMode = 'auto'; // 'auto' または 'adlib'
let rewardColorTimeoutIds = [];
let currentChordIndex = 0;
let isFreeSessionMode = false; // フリーセッション直接開始用フラグ

// パワーアップカードの候補テンプレート
const POWERUP_TEMPLATES = [
  { id: 'heal', name: '🩹 応急手当', desc: 'HPを最大値の50%回復します。', icon: '🩹' },
  { id: 'max_hp', name: '🧬 生命の源', desc: 'この冒険中、最大HPを+30し、HPを30回復。', icon: '🧬' },
  { id: 'atk', name: '⚡ 鋭い刃', desc: 'この冒険中、敵へ与えるダメージが+25%される。', icon: '⚡' },
  { id: 'time', name: '⏳ 時の砂時計', desc: 'この冒険中、制限時間が+4秒されます。', icon: '⏳' },
  { id: 'gold', name: '💎 財宝の袋', desc: 'ゴールドを即座に+30獲得します。', icon: '💎' }
];

// --- セーブ＆ロード・ショップ処理 ---
function loadGameData() {
  const data = localStorage.getItem(SAVE_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        saveData = {
          gold: parsed.gold || 0,
          highScore: parsed.highScore || 0,
          upgrades: {
            hp: parsed.upgrades?.hp || 1,
            atk: parsed.upgrades?.atk || 1,
            time: parsed.upgrades?.time || 1
          }
        };
      }
    } catch (e) {
      console.error("Failed to load save data:", e);
    }
  }
  updateLobbyUI();
}

function saveGameData() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
}

function updateLobbyUI() {
  document.getElementById('lobby-gold-val').textContent = saveData.gold;
  document.getElementById('lobby-highscore-val').textContent = saveData.highScore;

  // HP強化UI
  const hpLvl = saveData.upgrades.hp;
  const hpVal = 100 + (hpLvl - 1) * 20;
  const hpCost = hpLvl * 50;
  document.getElementById('upgrade-hp-lvl').textContent = hpLvl;
  document.getElementById('upgrade-hp-val').textContent = hpVal;
  document.getElementById('cost-hp').textContent = hpCost;
  document.getElementById('btn-upgrade-hp').disabled = saveData.gold < hpCost;

  // 攻撃力強化UI
  const atkLvl = saveData.upgrades.atk;
  const atkVal = (1.0 + (atkLvl - 1) * 0.15).toFixed(2);
  const atkCost = atkLvl * 50;
  document.getElementById('upgrade-atk-lvl').textContent = atkLvl;
  document.getElementById('upgrade-atk-val').textContent = atkVal;
  document.getElementById('cost-atk').textContent = atkCost;
  document.getElementById('btn-upgrade-atk').disabled = saveData.gold < atkCost;

  // 制限時間強化UI
  const timeLvl = saveData.upgrades.time;
  const timeVal = (timeLvl - 1) * 2;
  const timeCost = timeLvl * 50;
  document.getElementById('upgrade-time-lvl').textContent = timeLvl;
  document.getElementById('upgrade-time-val').textContent = timeVal;
  document.getElementById('cost-time').textContent = timeCost;
  document.getElementById('btn-upgrade-time').disabled = saveData.gold < timeCost;
}

function upgradeStat(statName) {
  const currentLvl = saveData.upgrades[statName];
  const cost = currentLvl * 50;
  if (saveData.gold >= cost) {
    saveData.gold -= cost;
    saveData.upgrades[statName]++;
    saveGameData();
    playLevelUpSE();
    updateLobbyUI();
  }
}

// 画面切り替え制御
function showRpgScreen(screenId) {
  const screens = ['baseline-lobby', 'baseline-battle', 'baseline-powerup', 'baseline-gameover'];
  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = (id === screenId) ? 'flex' : 'none';
    }
  });
}

function updatePlayerHpUI() {
  const hpPercent = Math.max(0, (runData.currentHp / runData.maxHp) * 100);
  const hpBar = document.getElementById('player-hp-bar');
  if (hpBar) hpBar.style.width = `${hpPercent}%`;
  const hpText = document.getElementById('player-hp-text');
  if (hpText) hpText.textContent = `${runData.currentHp} / ${runData.maxHp}`;
}

function damagePlayer(amount) {
  // ゲームオーバーにならないように、最小HPは1で留める
  runData.currentHp = Math.max(1, runData.currentHp - amount);
  updatePlayerHpUI();
  
  const hpBar = document.getElementById('player-hp-bar');
  if (hpBar) {
    hpBar.classList.add('damage');
    setTimeout(() => hpBar.classList.remove('damage'), 500);
  }
  
  playHurtSE();
  
  // 常に死なない
  return false;
}


// --- Web Audio API 初期化とエラーハンドリング ---
function getAudioContext() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      console.log("AudioContext created. State:", audioCtx.state);
    }
    
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

// システムエラー表示
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
  if (!ctx) return null;

  const now = ctx.currentTime;
  const start = Math.max(startTime, now);
  const end = start + duration;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(700, start);

  gainNode.gain.cancelScheduledValues(start);
  gainNode.gain.setValueAtTime(0, start);
  gainNode.gain.linearRampToValueAtTime(volume, start + 0.08); 
  gainNode.gain.setValueAtTime(volume, Math.max(start + 0.08, end - 0.12));
  gainNode.gain.exponentialRampToValueAtTime(0.0001, end);

  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(start);
  osc.stop(end);

  activeOscillators.push(osc);
  activeGainNodes.push(gainNode);
  return { osc, gainNode };
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
    if (note === notes[0]) {
      playTone(midiNoteToFreq(note - 12), start, duration, 'sine', 0.14 * volumeFactor);
    }
  });
}

// 太いベース音
function playBassTone(freq, startTime, duration, volume = 0.28) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const start = Math.max(startTime, now);
  const end = start + duration;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, start);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(250, start);

  gainNode.gain.cancelScheduledValues(start);
  gainNode.gain.setValueAtTime(0, start);
  gainNode.gain.linearRampToValueAtTime(volume, start + 0.04); 
  gainNode.gain.setValueAtTime(volume, Math.max(start + 0.04, end - 0.1));
  gainNode.gain.exponentialRampToValueAtTime(0.0001, end);

  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(start);
  osc.stop(end);

  activeOscillators.push(osc);
  activeGainNodes.push(gainNode);
}

// スネアドラム音シミュレーション (Noise & Pitched sine)
function playSnareBeat(startTime) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const start = Math.max(startTime, ctx.currentTime);

  // 1. ノイズによる高域スナップ
  const bufferSize = ctx.sampleRate * 0.12;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noiseNode = ctx.createBufferSource();
  noiseNode.buffer = buffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(1200, start);
  noiseFilter.Q.setValueAtTime(2.0, start);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.18, start);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);

  noiseNode.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noiseNode.start(start);
  noiseNode.stop(start + 0.13);

  // 2. 胴鳴り (低いサイン波)
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(180, start);
  osc.frequency.linearRampToValueAtTime(100, start + 0.07);

  oscGain.gain.setValueAtTime(0.15, start);
  oscGain.gain.exponentialRampToValueAtTime(0.001, start + 0.07);

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + 0.08);

  activeOscillators.push(noiseNode, osc);
  activeGainNodes.push(noiseGain, oscGain);
}

// キックドラム個別音
function playKickBeat(startTime) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const start = Math.max(startTime, ctx.currentTime);

  const oscKick = ctx.createOscillator();
  const gainKick = ctx.createGain();
  oscKick.frequency.setValueAtTime(120, start);
  oscKick.frequency.exponentialRampToValueAtTime(0.01, start + 0.15);
  
  gainKick.gain.setValueAtTime(0.28, start);
  gainKick.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
  
  oscKick.connect(gainKick);
  gainKick.connect(ctx.destination);
  oscKick.start(start);
  oscKick.stop(start + 0.2);

  activeOscillators.push(oscKick);
  activeGainNodes.push(gainKick);
}

// ハイハット個別音
function playHatBeat(startTime, volume = 0.04) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const start = Math.max(startTime, ctx.currentTime);

  const oscHat = ctx.createOscillator();
  const gainHat = ctx.createGain();
  oscHat.type = 'sine';
  oscHat.frequency.setValueAtTime(9500, start);
  
  gainHat.gain.setValueAtTime(volume, start);
  gainHat.gain.exponentialRampToValueAtTime(0.001, start + 0.03);
  
  oscHat.connect(gainHat);
  gainHat.connect(ctx.destination);
  oscHat.start(start);
  oscHat.stop(start + 0.04);

  activeOscillators.push(oscHat);
  activeGainNodes.push(gainHat);
}

// 従来の playDrumBeat の互換マッピング
function playDrumBeat(startTime) {
  playKickBeat(startTime);
  playHatBeat(startTime);
}

// ご褒美リードシンセ音色 (ディレイ残響付き)
function playLeadTone(freq, startTime, duration, volume = 0.14) {
  const ctx = getAudioContext();
  if (!ctx) return null;

  const now = ctx.currentTime;
  const start = Math.max(startTime, now);
  const end = start + duration;

  // メインリード音
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, start);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1300, start);

  gainNode.gain.cancelScheduledValues(start);
  gainNode.gain.setValueAtTime(0, start);
  gainNode.gain.linearRampToValueAtTime(volume, start + 0.05); 
  gainNode.gain.setValueAtTime(volume, Math.max(start + 0.05, end - 0.08));
  gainNode.gain.exponentialRampToValueAtTime(0.0001, end);

  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(start);
  osc.stop(end);

  activeOscillators.push(osc);
  activeGainNodes.push(gainNode);

  // ディレイ音 (0.24秒後, 音量約40%)
  const delayTime = start + 0.24;
  const delayVol = volume * 0.4;
  const oscD = ctx.createOscillator();
  const gainD = ctx.createGain();
  
  oscD.type = 'sine';
  oscD.frequency.setValueAtTime(freq, delayTime);
  
  gainD.gain.setValueAtTime(0, delayTime);
  gainD.gain.linearRampToValueAtTime(delayVol, delayTime + 0.05);
  gainD.gain.exponentialRampToValueAtTime(0.0001, delayTime + duration);
  
  oscD.connect(gainD);
  gainD.connect(ctx.destination);
  oscD.start(delayTime);
  oscD.stop(delayTime + duration);

  activeOscillators.push(oscD);
  activeGainNodes.push(gainD);

  return { oscillators: [osc, oscD], gains: [gainNode, gainD] };
}

// ==========================================================================
// ⚔️ 戦闘効果音 (SE) 合成
// ==========================================================================

function playSlashSE() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(1200, now);
  osc1.frequency.exponentialRampToValueAtTime(4500, now + 0.15);

  gain1.gain.setValueAtTime(0.18, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(800, now);
  osc2.frequency.exponentialRampToValueAtTime(3000, now + 0.12);

  gain2.gain.setValueAtTime(0.12, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);

  osc1.start(now);
  osc1.stop(now + 0.2);
  osc2.start(now);
  osc2.stop(now + 0.2);

  activeOscillators.push(osc1, osc2);
  activeGainNodes.push(gain1, gain2);
}

function playExplosionSE() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.exponentialRampToValueAtTime(30, now + 0.45);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(350, now);

  gain.gain.setValueAtTime(0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.55);

  activeOscillators.push(osc);
  activeGainNodes.push(gain);
}

function playHurtSE() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(110, now);
  osc.frequency.setValueAtTime(60, now + 0.08);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(180, now);

  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.3);

  activeOscillators.push(osc);
  activeGainNodes.push(gain);
}

function playLevelUpSE() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const notes = [60, 64, 67, 72];
  notes.forEach((note, index) => {
    const playTime = now + index * 0.09;
    const freq = midiNoteToFreq(note);
    playTone(freq, playTime, 0.22, 'sine', 0.15);
  });
}

function stopAllAudio() {
  isPlaying = false;
  
  document.getElementById('btn-play-resolve').classList.remove('playing');
  document.getElementById('btn-play-loop').classList.remove('playing');
  document.getElementById('btn-play-challenge').classList.remove('playing');
  document.getElementById('btn-play-baseline').classList.remove('playing');
  
  document.querySelector('#btn-play-resolve .play-icon').textContent = '▶';
  document.querySelector('#btn-play-loop .play-icon').textContent = '▶';
  document.querySelector('#btn-play-challenge .play-icon').textContent = '▶';
  document.querySelector('#btn-play-baseline .play-icon').textContent = '▶';

  if (loopIntervalId) {
    clearInterval(loopIntervalId);
    loopIntervalId = null;
  }
  if (playbackTimeoutId) {
    clearTimeout(playbackTimeoutId);
    playbackTimeoutId = null;
  }

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

  document.getElementById('choice-resolved').className = 'resolve-choice-btn';
  document.getElementById('choice-unresolved').className = 'resolve-choice-btn';

  const pool = KEYS.easy.filter(k => k.type === 'major');
  correctKey = pool[Math.floor(Math.random() * pool.length)];
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
    chordSequence = [
      { notes: [R, R + 4, R + 7, R + 12], duration: 1.2 },
      { notes: [R + 5, R + 9, R + 12, R + 17], duration: 1.2 },
      { notes: [R + 7, R + 11, R + 14, R + 19], duration: 1.2 },
      step1IsResolved 
        ? { notes: [R, R + 4, R + 7, R + 12], duration: 1.8 }
        : { notes: [R + 7, R + 11, R + 14, R + 19], duration: 1.8 }
    ];
  } else {
    chordSequence = [
      { notes: [R, R + 3, R + 7, R + 12], duration: 1.2 },
      { notes: [R + 5, R + 8, R + 12, R + 17], duration: 1.2 },
      { notes: [R + 7, R + 11, R + 14, R + 19], duration: 1.2 },
      step1IsResolved 
        ? { notes: [R, R + 3, R + 7, R + 12], duration: 1.8 }
        : { notes: [R + 7, R + 11, R + 14, R + 19], duration: 1.8 }
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
// ラーニングモード - ステップ2: 主音を探せ！
// ==========================================================================

function initFindTonicQuestion() {
  stopAllAudio();
  isAnswered = false;
  step2SelectedOffset = null;
  
  document.getElementById('selected-note-name').textContent = 'なし';
  document.getElementById('btn-submit-tonic').disabled = true;
  
  const feedbackPanel = document.getElementById('feedback-panel');
  feedbackPanel.className = 'feedback-panel';
  feedbackMessage.textContent = '伴奏ループを流しながら、鍵盤で一番しっくりくる「主音」を鳴らして探そう！';

  document.querySelectorAll('.key').forEach(key => key.classList.remove('active'));

  const pool = KEYS.easy.filter(k => k.type === 'major');
  correctKey = pool[Math.floor(Math.random() * pool.length)];
}

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
      playChord(chord.notes, now + index * 1.1, chord.duration, 0.7);
    });
  };

  playOnce();
  loopIntervalId = setInterval(playOnce, 4400);
}

function handleKeyTrigger(keyElement) {
  const offset = parseInt(keyElement.dataset.midiOffset, 10);
  const noteName = keyElement.dataset.note;
  
  document.querySelectorAll('.key').forEach(k => k.classList.remove('active'));
  keyElement.classList.add('active');

  const displayNoteName = noteName.replace('2', '');
  document.getElementById('selected-note-name').textContent = displayNoteName;
  step2SelectedOffset = offset;
  document.getElementById('btn-submit-tonic').disabled = false;

  const baseMidiNote = 60 + offset; 
  const freq = midiNoteToFreq(baseMidiNote);
  
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  playTone(freq, now, 0.8, 'sine', 0.22);
}

function submitTonicAnswer() {
  if (isAnswered || step2SelectedOffset === null) return;
  isAnswered = true;
  
  stopAllAudio();

  const feedbackPanel = document.getElementById('feedback-panel');
  const feedbackMessage = document.getElementById('feedback-message');
  
  const correctNoteName = correctKey.noteName;
  const userNoteName = NOTE_NAMES[step2SelectedOffset];

  if (userNoteName === correctNoteName) {
    score += 15;
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
    feedbackMessage.innerHTML = `😢 <strong>残念！</strong> (今回のキー: <strong>${correctKey.name}</strong>)<br>あなたが選んだ音は <strong>${userNoteName}</strong> でした。この曲の正しい主音は <strong>${correctNoteName}</strong> です。主音を鳴らした時の「スーッと馴染む感覚」を覚えておきましょう。`;
    
    document.getElementById('streak-val').textContent = streak;

    highlightCorrectKey(correctNoteName);

    setTimeout(() => {
      initFindTonicQuestion();
    }, 3800);
  }
}

function highlightCorrectKey(correctNoteName) {
  document.querySelectorAll('.key').forEach(key => {
    const note = key.dataset.note.replace('2', '');
    if (note === correctNoteName) {
      key.classList.add('active');
    }
  });
}

// ==========================================================================
// ⚔️ RPGモンスター討伐バトルモード
//    - 新ルール：1音ずつ当てる（4拍） ➡️ 最後に全体のキー当て
// ==========================================================================

function initBaselineQuestion() {
  stopAllAudio();
  stopBattleTimer();
  isAnswered = false;
  
  // 状態変数初期化
  baselineRound = 1;
  userBaselineInput = [];
  isKeyQuizMode = false;

  // UI切り替え (指板表示、4択非表示)
  const fretBoardUI = document.getElementById('fretboard-ui-container');
  if (fretBoardUI) fretBoardUI.style.display = 'block';
  const keyChoices = document.getElementById('baseline-key-choices');
  if (keyChoices) keyChoices.style.display = 'none';

  // 履歴スロットのリセット
  updateTrackerUI();
  document.querySelectorAll('.fret-node').forEach(node => node.classList.remove('active'));

  const feedbackPanel = document.getElementById('feedback-panel');
  feedbackPanel.className = 'feedback-panel';
  document.getElementById('feedback-message').textContent = '再生ボタンを押して、第1音の弱点を耳で暴こう！';

  // 定番コードからランダムに1問選択
  currentProgression = BASELINE_PROGRESSIONS[Math.floor(Math.random() * BASELINE_PROGRESSIONS.length)];

  // モンスター情報更新
  updateMonsterUI();

  // タイムリミットタイマーの設定
  const maxTime = Math.max(12, 20 - monsterLevel) + (saveData.upgrades.time - 1) * 2 + runData.tempUpgrades.bonusTime;
  battleTimeLeft = maxTime;
  updateTimerBarUI();
}

// モンスターUI更新
function updateMonsterUI() {
  const mIndex = (monsterLevel - 1) % MONSTER_TEMPLATES.length;
  const mTemplate = MONSTER_TEMPLATES[mIndex];

  const loops = Math.floor((monsterLevel - 1) / MONSTER_TEMPLATES.length);
  monsterMaxHP = mTemplate.maxHp + loops * 50;

  // 新しいモンスター出現時（1音目の時）、HPを満タンにする
  if (baselineRound === 1) {
    monsterCurrentHP = monsterMaxHP;
  }

  document.getElementById('monster-name').textContent = mTemplate.name;
  document.getElementById('monster-level').textContent = `Lv.${monsterLevel}`;

  const sprite = document.getElementById('monster-sprite');
  if (sprite) {
    sprite.style.borderColor = mTemplate.color;
    sprite.style.background = `linear-gradient(135deg, ${mTemplate.color} 0%, #111122 100%)`;
    sprite.style.boxShadow = `0 0 20px ${mTemplate.color}66`;
    sprite.className = 'monster-sprite';
  }
  
  updateHpBarUI();
}

function updateHpBarUI() {
  const hpPercent = Math.max(0, (monsterCurrentHP / monsterMaxHP) * 100);
  const hpBar = document.getElementById('monster-hp-bar');
  if (hpBar) hpBar.style.width = `${hpPercent}%`;
  const hpText = document.getElementById('monster-hp-text');
  if (hpText) hpText.textContent = `${monsterCurrentHP} / ${monsterMaxHP}`;
}

function updateTimerBarUI() {
  const maxTime = Math.max(12, 20 - monsterLevel) + (saveData.upgrades.time - 1) * 2 + runData.tempUpgrades.bonusTime;
  const timePercent = Math.max(0, (battleTimeLeft / maxTime) * 100);
  const timerBar = document.getElementById('battle-timer-bar');

  if (timerBar) {
    timerBar.style.width = `${timePercent}%`;
    timerBar.className = 'timer-bar';
    if (battleTimeLeft <= 4) {
      timerBar.classList.add('danger');
    } else if (battleTimeLeft <= maxTime / 2) {
      timerBar.classList.add('warning');
    }
  }
}

function startBattleTimer() {
  stopBattleTimer();
  const maxTime = Math.max(12, 20 - monsterLevel) + (saveData.upgrades.time - 1) * 2 + runData.tempUpgrades.bonusTime;
  battleTimeLeft = maxTime;
  updateTimerBarUI();

  battleTimerIntervalId = setInterval(() => {
    if (isPlaying) return; // 試聴再生中はタイマーをストップ
    if (isAnswered) {
      stopBattleTimer();
      return;
    }

    battleTimeLeft--;
    updateTimerBarUI();

    if (battleTimeLeft <= 0) {
      stopBattleTimer();
      handleBattleTimeout();
    }
  }, 1000);
}

function stopBattleTimer() {
  if (battleTimerIntervalId) {
    clearInterval(battleTimerIntervalId);
    battleTimerIntervalId = null;
  }
}

// タイムアップ時
function handleBattleTimeout() {
  isAnswered = true;
  stopAllAudio();
  comboCount = 0;

  // タイムアップは大ダメージ (最大HPの35%)
  const damage = Math.ceil(runData.maxHp * 0.35);
  const isDead = damagePlayer(damage);

  const feedbackPanel = document.getElementById('feedback-panel');
  
  if (isDead) {
    feedbackPanel.className = 'feedback-panel error';
    if (isKeyQuizMode) {
      feedbackPanel.innerHTML = `⚠️ <strong>タイムアップ！</strong><br>キーを当てる時間がありませんでした！今回の正しいキーは <strong>${currentProgression.keyName}</strong> でした。`;
    } else {
      feedbackPanel.innerHTML = `⚠️ <strong>タイムアップ！</strong><br>モンスターから反撃を受け、力尽きました...`;
    }
    return; // 死亡時は以降の処理を行わない
  }

  feedbackPanel.className = 'feedback-panel error';
  if (isKeyQuizMode) {
    feedbackPanel.innerHTML = `⚠️ <strong>タイムアップ！ (HPダメージ -${damage})</strong><br>キーを当てる時間がありませんでした！今回の正しいキーは <strong>${currentProgression.keyName}</strong> でした。`;
  } else {
    feedbackPanel.innerHTML = `⚠️ <strong>タイムアップ！ (HPダメージ -${damage})</strong><br>モンスターから反撃を受け、問題がリセットされました！`;
  }
  
  document.getElementById('streak-val').textContent = 0;

  setTimeout(() => {
    initBaselineQuestion();
  }, 4000);
}

// ドラム＋伴奏コード＋ベース演奏 (1音ずつ解明していくシーケンサー)
function playBaselineSequence() {
  if (isPlaying) {
    stopAllAudio();
    document.getElementById('status-baseline').textContent = '演奏を停止しました';
    return;
  }

  const ctx = getAudioContext();
  const now = ctx.currentTime;
  isPlaying = true;

  document.getElementById('btn-play-baseline').classList.add('playing');
  document.querySelector('#btn-play-baseline .play-icon').textContent = '■';
  
  if (isKeyQuizMode) {
    document.getElementById('status-baseline').textContent = '全4音のコード進行ループ再生中... キーを推測せよ！';
  } else {
    document.getElementById('status-baseline').textContent = `第${baselineRound}音目のコード伴奏を試聴中...`;
  }

  // 1拍のテンポ設定 (1拍=0.66s, 1コード=2拍=1.32s)
  const stepTime = 1.32; 

  // 再生する範囲を決定 (クイズモードなら全4音、通常なら現在ラウンドまでの音)
  const limit = isKeyQuizMode ? 4 : baselineRound;

  for (let i = 0; i < limit; i++) {
    const startTime = now + i * stepTime;
    const chordNotes = currentProgression.chords[i];
    const step = currentProgression.sequence[i];

    // 1. 伴奏コードの優しく再生
    playChord(chordNotes, startTime, stepTime - 0.1, 0.45);

    // 2. ドラム (各拍の頭)
    playDrumBeat(startTime);

    // 3. ベース音 (最後の音はクイズ対象なので少し目立たせる)
    const stringData = FRET_NOTES[step.string].find(f => f.fret === step.fret);
    if (stringData) {
      const isTarget = (!isKeyQuizMode && i === baselineRound - 1);
      const bassVolume = isTarget ? 0.38 : 0.28;
      playBassTone(midiNoteToFreq(stringData.note), startTime, stepTime - 0.05, bassVolume);
    }
  }

  const totalPlaybackTime = limit * stepTime;

  playbackTimeoutId = setTimeout(() => {
    isPlaying = false;
    document.getElementById('btn-play-baseline').classList.remove('playing');
    document.querySelector('#btn-play-baseline .play-icon').textContent = '▶';
    
    if (isKeyQuizMode) {
      document.getElementById('status-baseline').textContent = 'コード進行全体の響きを頼りに、キーを選択せよ！';
    } else {
      document.getElementById('status-baseline').textContent = `第${baselineRound}音目の音を指板から見つけ出せ！`;
    }
    
    // 再生完了後にタイマー始動
    startBattleTimer();
  }, totalPlaybackTime * 1000 + 200);
}

// ギター指板タップ時のリアルタイム回答判定 (1音ずつの正誤判定)
function handleFretboardTrigger(element) {
  if (isAnswered || isPlaying) return;
  if (isKeyQuizMode) return; // キー当て中は指板無効

  const stringNum = parseInt(element.dataset.string, 10);
  const fretNum = parseInt(element.dataset.fret, 10);
  const noteChar = element.dataset.note;

  // タップ音再生
  const fretData = FRET_NOTES[stringNum].find(f => f.fret === fretNum);
  if (fretData) {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    playBassTone(midiNoteToFreq(fretData.note), now, 0.9, 0.35);
  }

  element.classList.add('active');
  setTimeout(() => element.classList.remove('active'), 250);

  // 正解となる現在の音
  const correctStep = currentProgression.sequence[baselineRound - 1];

  // 判定（音名比較で異弦同音に対応）
  if (noteChar === correctStep.name) {
    // === 1音正解！ ===
    comboCount++;
    
    // 斬撃エフェクト＆SE
    playSlashSE();
    const slash = document.getElementById('slash-effect');
    if (slash) {
      slash.classList.add('active');
      setTimeout(() => slash.classList.remove('active'), 350);
    }

    const sprite = document.getElementById('monster-sprite');
    if (sprite) {
      sprite.classList.add('damage');
      setTimeout(() => sprite.classList.remove('damage'), 500);
    }

    // モンスターにダメージ（攻撃力強化レベルと冒険中の強化カードの乗算）
    const baseDmg = Math.floor(monsterMaxHP * 0.2) + (comboCount - 1) * 3;
    const atkMultiplier = 1.0 + (saveData.upgrades.atk - 1) * 0.15 + runData.tempUpgrades.bonusAtk;
    const dmg = Math.floor(baseDmg * atkMultiplier);
    
    monsterCurrentHP = Math.max(0, monsterCurrentHP - dmg);
    updateHpBarUI();

    // コンボポップアップ表示
    const popup = document.getElementById('combo-popup');
    if (popup) {
      popup.innerHTML = `⚔️ ${baselineRound}拍目 HIT! (-${dmg})`;
      popup.style.color = '#00f5d4';
      popup.classList.add('active');
      setTimeout(() => popup.classList.remove('active'), 800);
    }

    // 履歴に追加
    userBaselineInput.push({
      string: stringNum,
      fret: fretNum,
      name: noteChar
    });
    updateTrackerUI();

    // 次のラウンド判定へ
    baselineRound++;
    
    if (baselineRound <= 4) {
      // 次の1音の回答フェーズへ
      const feedbackPanel = document.getElementById('feedback-panel');
      feedbackPanel.className = 'feedback-panel success';
      document.getElementById('feedback-message').innerHTML = `🎉 <strong>正解！ (-${dmg} ダメージ)</strong><br>弱点を1つ破壊しました。次は第${baselineRound}音目の音を聴き取りましょう。`;

      isAnswered = true;
      stopBattleTimer();

      setTimeout(() => {
        isAnswered = false;
        document.getElementById('status-baseline').textContent = '再生ボタンを押して、次の音を聴こう';
        playBaselineSequence(); // 自動的に連続再生
      }, 1500);

    } else {
      // 4音すべて正解 ➡️ キー当てクイズへ移行！
      isAnswered = true;
      stopBattleTimer();

      const feedbackPanel = document.getElementById('feedback-panel');
      feedbackPanel.className = 'feedback-panel success';
      document.getElementById('feedback-message').innerHTML = `🔥 <strong>ベースライン完全解明！ (-${dmg} ダメージ)</strong><br>モンスターのコアが露出しました！最後の仕上げにキー（調）を当ててください！`;

      setTimeout(() => {
        startKeyQuizPhase();
      }, 2000);
    }

  } else {
    // === 不正解（ミス） ===
    comboCount = 0;

    // プレイヤーが被弾（最大HPの15%ダメージ）
    const damageAmount = Math.ceil(runData.maxHp * 0.15);
    const isDead = damagePlayer(damageAmount);
    
    if (isDead) return; // 死亡時は以降の処理を行わない

    // 制限時間をペナルティとして2秒減少
    battleTimeLeft = Math.max(1, battleTimeLeft - 2);
    updateTimerBarUI();

    const feedbackPanel = document.getElementById('feedback-panel');
    feedbackPanel.className = 'feedback-panel error';
    document.getElementById('feedback-message').innerHTML = `😢 <strong>ミス！音程が違います。</strong><br>現在の第${baselineRound}音目をもう一度よく聴き直してください。<br>(HPダメージ -${damageAmount} / 制限時間ペナルティ -2秒)`;
  }
}

// 履歴トラッカー表示更新
function updateTrackerUI() {
  const slots = document.getElementById('tracker-slots').children;
  for (let i = 0; i < 4; i++) {
    const slot = slots[i];
    slot.className = 'slot';
    
    if (i < userBaselineInput.length) {
      const input = userBaselineInput[i];
      slot.classList.add('filled');
      slot.innerHTML = `${input.string}弦${input.fret}F<span class="note-char">${input.name}</span>`;
    } else {
      slot.innerHTML = '？';
      if (i === baselineRound - 1 && !isKeyQuizMode) {
        slot.classList.add('active-input'); // 現在入力すべきスロットを光らせる
      }
    }
  }
}

// キー当てクイズの開始
function startKeyQuizPhase() {
  isKeyQuizMode = true;
  isAnswered = false;

  // 指板UIを隠し、キー選択肢UIを表示
  document.getElementById('fretboard-ui-container').style.display = 'none';
  const quizUI = document.getElementById('baseline-key-choices');
  quizUI.style.display = 'block';

  // 4択キーボタンの生成
  const correctKeyName = currentProgression.keyName;
  const targetPool = KEYS.easy.filter(k => k.type === 'major'); // 選択肢プール (メジャーのみ)
  
  let choices = targetPool.filter(k => k.name === correctKeyName);
  // もしプールに正解がなかった場合（例外対策）
  if (choices.length === 0) {
    choices.push({ name: correctKeyName, type: 'major' });
  }

  const otherKeys = targetPool.filter(k => k.name !== correctKeyName);
  const shuffledOthers = shuffleArray(otherKeys);
  for (let i = 0; i < Math.min(3, shuffledOthers.length); i++) {
    choices.push(shuffledOthers[i]);
  }

  choices = shuffleArray(choices);

  const grid = document.getElementById('baseline-key-grid');
  grid.innerHTML = '';

  choices.forEach(key => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = key.name;
    btn.addEventListener('click', () => submitBaselineKeyAnswer(key.name, btn));
    grid.appendChild(btn);
  });

  // タイマー再スタート（猶予12秒）
  battleTimeLeft = 12;
  startBattleTimer();

  document.getElementById('status-baseline').textContent = 'ファイナルラウンド：正しいキー（調）のボタンを押せ！';
}

// 最終キー判定
function submitBaselineKeyAnswer(selectedKeyName, selectedButton) {
  if (isAnswered) return;
  isAnswered = true;
  stopAllAudio();
  stopBattleTimer();

  const feedbackPanel = document.getElementById('feedback-panel');
  const feedbackMessage = document.getElementById('feedback-message');
  const allButtons = document.querySelectorAll('#baseline-key-grid .choice-btn');
  const correctKeyName = currentProgression.keyName;

  if (selectedKeyName === correctKeyName) {
    // === 大正解！モンスター撃破！ ===
    score += 35; // ボスクリア高得点
    streak += 1;

    // ゴールド獲得 (基本20 + レベルボーナス)
    const goldPrize = 20 + monsterLevel * 5;
    runData.goldGained += goldPrize;
    
    document.getElementById('score-val').textContent = score;
    document.getElementById('streak-val').textContent = streak;
    const runGoldVal = document.getElementById('run-gold-val');
    if (runGoldVal) runGoldVal.textContent = runData.goldGained;

    selectedButton.classList.add('correct');
    feedbackPanel.className = 'feedback-panel success';
    feedbackMessage.innerHTML = `🎉 <strong>大正解！！ モンスターを撃破しました！ (+💰${goldPrize}を獲得)</strong><br>今回のコード進行: <strong>${currentProgression.name}</strong><br>正解のキー: <strong>${correctKeyName}</strong>`;

    // 1. モンスター消滅（爆発）アニメーション
    const sprite = document.getElementById('monster-sprite');
    if (sprite) sprite.classList.add('dead');

    // 2. モンスターHPを0に
    monsterCurrentHP = 0;
    updateHpBarUI();

    // 3. 爆発SE
    setTimeout(() => playExplosionSE(), 200);

    // 4. ご褒美演奏フェーズへ移行
    setTimeout(() => {
      if (sprite) sprite.classList.remove('dead');
      startRewardPhase(); // ご褒美セッションの開始
    }, 2200);

  } else {
    // === 不正解 ===
    streak = 0;
    document.getElementById('streak-val').textContent = 0;

    // プレイヤーが被弾（最大HPの25%ダメージ）
    const damageAmount = Math.ceil(runData.maxHp * 0.25);
    const isDead = damagePlayer(damageAmount);

    selectedButton.classList.add('incorrect');
    feedbackPanel.className = 'feedback-panel error';
    
    // 正解キーをハイライト
    allButtons.forEach(btn => {
      if (btn.textContent === correctKeyName) {
        btn.classList.add('correct');
      }
    });

    if (isDead) {
      feedbackMessage.innerHTML = `💀 <strong>無念！キーが違います！</strong><br>正解のキーは <strong>${correctKeyName}</strong> でした。モンスターの反撃により力尽きました...`;
      return; // 死亡時はリスタートしない
    }

    feedbackMessage.innerHTML = `😢 <strong>無念！キーが違います！ (HPダメージ -${damageAmount})</strong><br>正解のキーは <strong>${correctKeyName}</strong> でした。<br>もう一度響きをインプットして、次の討伐に挑みましょう！`;

    // 4.5秒後に同じモンスターでリスタート
    setTimeout(() => {
      initBaselineQuestion();
    }, 4500);
  }
}

// ==========================================================================
// チャレンジモード - 従来のキー当てクイズ
// ==========================================================================

function initChallengeQuestion() {
  stopAllAudio();
  stopBattleTimer();
  isAnswered = false;
  document.getElementById('btn-hint').disabled = true;
  
  const feedbackPanel = document.getElementById('feedback-panel');
  feedbackPanel.className = 'feedback-panel';
  document.getElementById('feedback-message').textContent = '再生ボタンを押してコードを聴き、キーを当てましょう！';

  // メジャーキーのみに絞り込む
  const pool = KEYS[currentDifficulty].filter(k => k.type === 'major');
  correctKey = pool[Math.floor(Math.random() * pool.length)];

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

// --- 冒険（Run）開始・パワーアップ・ゲームオーバー管理 ---

function startRpgRun() {
  monsterLevel = 1;
  runData.goldGained = 0;
  
  // 永続強化レベルを適用して最大HPを設定
  runData.maxHp = 100 + (saveData.upgrades.hp - 1) * 20;
  runData.currentHp = runData.maxHp;
  
  // パワーアップカードによる冒険中バフをリセット
  runData.tempUpgrades = {
    bonusAtk: 0,
    bonusTime: 0
  };
  
  updatePlayerHpUI();
  
  const runGoldVal = document.getElementById('run-gold-val');
  if (runGoldVal) runGoldVal.textContent = 0;
  
  showRpgScreen('baseline-battle');
  initBaselineQuestion();
}

function showPowerupSelection() {
  stopAllAudio();
  stopBattleTimer();
  
  const container = document.getElementById('powerup-cards-container');
  if (container) {
    container.innerHTML = '';
    
    // ランダムに3つの異なるカードを抽出して生成
    const shuffled = shuffleArray(POWERUP_TEMPLATES);
    const selectedCards = shuffled.slice(0, 3);
    
    selectedCards.forEach(card => {
      const cardEl = document.createElement('div');
      cardEl.className = 'powerup-card';
      cardEl.innerHTML = `
        <span class="card-icon">${card.icon}</span>
        <span class="card-name">${card.name}</span>
        <span class="card-desc">${card.desc}</span>
      `;
      cardEl.addEventListener('click', () => applyPowerup(card.id));
      container.appendChild(cardEl);
    });
  }
  
  showRpgScreen('baseline-powerup');
}

function applyPowerup(cardId) {
  switch (cardId) {
    case 'heal':
      // 最大HPの50%回復
      runData.currentHp = Math.min(runData.maxHp, runData.currentHp + Math.round(runData.maxHp * 0.5));
      break;
    case 'max_hp':
      // 最大HP+30 & 30回復
      runData.maxHp += 30;
      runData.currentHp += 30;
      break;
    case 'atk':
      // 攻撃力倍率+25%
      runData.tempUpgrades.bonusAtk += 0.25;
      break;
    case 'time':
      // 制限時間+4秒
      runData.tempUpgrades.bonusTime += 4;
      break;
    case 'gold':
      // ゴールド即時獲得
      runData.goldGained += 30;
      const runGoldVal = document.getElementById('run-gold-val');
      if (runGoldVal) runGoldVal.textContent = runData.goldGained;
      break;
  }
  
  updatePlayerHpUI();
  playLevelUpSE();
  
  // モンスターレベル上昇
  monsterLevel++;
  
  // 戦闘画面へ戻り、次の問題開始
  showRpgScreen('baseline-battle');
  initBaselineQuestion();
}

function handleGameOver() {
  stopAllAudio();
  stopBattleTimer();
  
  // 獲得したゴールドを永続データに加算
  saveData.gold += runData.goldGained;
  
  // ハイスコア判定
  if (score > saveData.highScore) {
    saveData.highScore = score;
  }
  
  // ローカルストレージにセーブデータを書き込み
  saveGameData();
  
  // リザルトUIへ反映
  const resLvl = document.getElementById('result-level');
  if (resLvl) resLvl.textContent = `Lv.${monsterLevel}`;
  const resGold = document.getElementById('result-gold');
  if (resGold) resGold.textContent = `💰 ${runData.goldGained}`;
  const resScore = document.getElementById('result-score');
  if (resScore) resScore.textContent = score;
  
  showRpgScreen('baseline-gameover');
}

// --- ご褒美セッション演奏ロジック ---
let isRewardPlaying = false;
let rewardLoopTimeoutId = null;


function startRewardPhase() {
  stopAllAudio();
  stopBattleTimer();
  isAnswered = true;
  isRewardPlaying = true;

  // モードを自動演奏に初期化
  rewardPlayMode = 'auto';
  currentChordIndex = 0;

  // UI表示切り替え
  const toggleBtn = document.getElementById('btn-reward-mode-toggle');
  if (toggleBtn) {
    toggleBtn.textContent = '🤖 自動演奏モード中';
    toggleBtn.classList.remove('adlib-active');
  }
  
  // アドリブ指板を最初から表示する
  const adlibWrapper = document.getElementById('adlib-fretboard-wrapper');
  if (adlibWrapper) {
    adlibWrapper.style.display = 'flex';
  }

  // スキップボタンのテキストをフリーセッション状態に合わせて切り替える
  const skipBtn = document.getElementById('btn-skip-reward');
  if (skipBtn) {
    if (isFreeSessionMode) {
      skipBtn.textContent = '🏡 ロビーへ戻る';
    } else {
      skipBtn.textContent = '🎁 パワーアップカードを選択する';
    }
  }

  const fretboard = document.getElementById('fretboard-ui-container');
  if (fretboard) fretboard.style.display = 'none';
  const keyChoices = document.getElementById('baseline-key-choices');
  if (keyChoices) keyChoices.style.display = 'none';
  const rewardArea = document.getElementById('baseline-reward-area');
  if (rewardArea) rewardArea.style.display = 'flex';

  const baselineVisualizer = document.getElementById('baseline-visualizer-container');
  if (baselineVisualizer) baselineVisualizer.style.display = 'none';

  const statusBaseline = document.getElementById('status-baseline');
  if (statusBaseline) {
    statusBaseline.textContent = isFreeSessionMode 
      ? 'Free Session! ご褒美セッション演奏中！'
      : 'Victory Performance! ご褒美セッション演奏中！';
  }

  // ループ演奏スタート
  playRewardLoop();
}

function stopRewardPhase() {
  isRewardPlaying = false;
  
  if (rewardLoopTimeoutId) {
    clearTimeout(rewardLoopTimeoutId);
    rewardLoopTimeoutId = null;
  }
  
  rewardColorTimeoutIds.forEach(id => clearTimeout(id));
  rewardColorTimeoutIds = [];
  
  stopAllAudio();
  
  // ご褒美エリアを非表示にする
  const rewardArea = document.getElementById('baseline-reward-area');
  if (rewardArea) rewardArea.style.display = 'none';
  
  // 討伐再生ボタンの表示を元に戻す
  const baselineVisualizer = document.getElementById('baseline-visualizer-container');
  if (baselineVisualizer) baselineVisualizer.style.display = 'block';

  
  // フラグに応じて遷移先を変更
  if (isFreeSessionMode) {
    isFreeSessionMode = false; // フラグをリセット
    updateLobbyUI();
    showRpgScreen('baseline-lobby');
  } else {
    // 通常の討伐後であればパワーアップ選択画面へ移行
    showPowerupSelection();
  }
}

// ロビーから直接フリーセッションを開始する
function startFreeSession() {
  stopAllAudio();
  stopBattleTimer();
  isAnswered = true;
  isFreeSessionMode = true;
  
  // もし進行データがない場合はC Majorの王道進行をデフォルトとしてセット
  if (!currentProgression) {
    const majorProgressions = BASELINE_PROGRESSIONS.filter(p => p.keyName === 'C Major');
    if (majorProgressions.length > 0) {
      currentProgression = majorProgressions[Math.floor(Math.random() * majorProgressions.length)];
    } else {
      currentProgression = BASELINE_PROGRESSIONS[0];
    }
  }
  
  // 戦闘画面を表示してからご褒美エリアを重ねる
  showRpgScreen('baseline-battle');
  startRewardPhase();
}

let autoMelodyOscillators = [];
let autoMelodyGainNodes = [];

function stopAutoMelody() {
  autoMelodyGainNodes.forEach(gainNode => {
    try {
      if (audioCtx) {
        gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
      }
    } catch (e) {}
  });
  
  setTimeout(() => {
    autoMelodyOscillators.forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    autoMelodyOscillators = [];
    autoMelodyGainNodes = [];
  }, 60);

  document.querySelectorAll('.adlib-fret-node').forEach(node => {
    node.classList.remove('playing-now');
  });
}

// 自動演奏・アドリブモード切り替え
function toggleRewardMode() {
  const toggleBtn = document.getElementById('btn-reward-mode-toggle');
  
  if (rewardPlayMode === 'auto') {
    rewardPlayMode = 'adlib';
    if (toggleBtn) {
      toggleBtn.textContent = '🎸 自分で演奏モード中';
      toggleBtn.classList.add('adlib-active');
    }
    stopAutoMelody(); // 自動演奏を瞬時に消音
  } else {
    rewardPlayMode = 'auto';
    if (toggleBtn) {
      toggleBtn.textContent = '🤖 自動演奏モード中';
      toggleBtn.classList.remove('adlib-active');
    }
  }
}

function updateAdlibFretboardColors(chordIndex) {
  if (!currentProgression) return;
  
  const progressionKey = KEYS.easy.find(k => k.name === currentProgression.keyName) || KEYS.easy[0];
  const root = progressionKey.root;
  const isMinor = progressionKey.type === 'minor';
  
  // 1. トニック音のピッチクラス (0〜11)
  const tonicPitch = root % 12;
  
  // 2. キーのダイアトニックスケール音ピッチクラスのリスト (7音)
  const diatonicSteps = isMinor ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
  const diatonicPitches = diatonicSteps.map(step => (root + step) % 12);
  
  // 3. ダイアトニックコードの音（1, 2, 3, 5, 6度 ＝ ペンタトニックの5音）のピッチクラスのリスト
  const pentatonicSteps = isMinor ? [0, 3, 5, 7, 10] : [0, 2, 4, 7, 9];
  const pentatonicPitches = pentatonicSteps.map(step => (root + step) % 12);

  // 全てのアドリブ指板ノードをループして役割判定し、対応するCSSクラスを付与
  document.querySelectorAll('.adlib-fret-node').forEach(node => {
    const stringNum = parseInt(node.dataset.string, 10);
    const fretNum = parseInt(node.dataset.fret, 10);
    
    const fretData = FRET_NOTES[stringNum].find(f => f.fret === fretNum);
    if (!fretData) return;
    
    const pitchClass = fretData.note % 12;
    
    // クラスをクリア
    node.classList.remove('note-tonic', 'note-chordtone', 'note-scale', 'note-avoid');
    
    // 優先度判定：主音（トニック）＞ダイアトニックコードの音（1,2,3,5,6度）＞スケール音（ダイアトニックの残り 4,7度）＞合いにくい音（それ以外）
    if (pitchClass === tonicPitch) {
      node.classList.add('note-tonic');
    } else if (pentatonicPitches.includes(pitchClass)) {
      node.classList.add('note-chordtone');
    } else if (diatonicPitches.includes(pitchClass)) {
      node.classList.add('note-scale');
    } else {
      node.classList.add('note-avoid');
    }
  });
}

// 自動演奏のノートに対応する指板ノードを一時的に発光させる (オクターブが一致する1箇所のみ)
function flashAdlibFretboardNode(note) {
  let flashed = false;
  
  // 1. 手動タップ時の運指に対応する「2オクターブ下 (note - 24)」を最優先でヒットさせる
  document.querySelectorAll('.adlib-fret-node').forEach(node => {
    if (flashed) return;
    
    const stringNum = parseInt(node.dataset.string, 10);
    const fretNum = parseInt(node.dataset.fret, 10);
    const fretData = FRET_NOTES[stringNum].find(f => f.fret === fretNum);
    
    if (fretData && fretData.note === (note - 24)) {
      node.classList.add('playing-now');
      setTimeout(() => node.classList.remove('playing-now'), 250);
      flashed = true;
    }
  });

  // 2. 見つからない場合は「1オクターブ下 (note - 12)」を探す
  if (!flashed) {
    document.querySelectorAll('.adlib-fret-node').forEach(node => {
      if (flashed) return;
      
      const stringNum = parseInt(node.dataset.string, 10);
      const fretNum = parseInt(node.dataset.fret, 10);
      const fretData = FRET_NOTES[stringNum].find(f => f.fret === fretNum);
      
      if (fretData && fretData.note === (note - 12)) {
        node.classList.add('playing-now');
        setTimeout(() => node.classList.remove('playing-now'), 250);
        flashed = true;
      }
    });
  }
  
  // 3. 万が一一致するオクターブフレットがない場合のフォールバック（ピッチクラス一致する最初の1つ）
  if (!flashed) {
    document.querySelectorAll('.adlib-fret-node').forEach(node => {
      if (flashed) return;
      const stringNum = parseInt(node.dataset.string, 10);
      const fretNum = parseInt(node.dataset.fret, 10);
      const fretData = FRET_NOTES[stringNum].find(f => f.fret === fretNum);
      if (fretData && (fretData.note % 12) === (note % 12)) {
        node.classList.add('playing-now');
        setTimeout(() => node.classList.remove('playing-now'), 250);
        flashed = true;
      }
    });
  }
}

// アドリブギター指板タップ時の発音
function handleAdlibFretboardTrigger(element) {
  if (!isRewardPlaying) return;
  
  const stringNum = parseInt(element.dataset.string, 10);
  const fretNum = parseInt(element.dataset.fret, 10);
  
  const fretData = FRET_NOTES[stringNum].find(f => f.fret === fretNum);
  if (fretData) {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // リードの音域として、戦闘用のベース音(オクターブ下)からオクターブを2つ上げて鳴らす
    const leadMidiNote = fretData.note + 24;
    const freq = midiNoteToFreq(leadMidiNote);
    playLeadTone(freq, now, 0.4, 0.22);
  }
  
  element.classList.add('active');
  setTimeout(() => element.classList.remove('active'), 150);
}

function generateMelodyPattern(scaleNotes, chordProgression) {
  const melodyPattern = [];
  // スケールの中央付近（リードとして心地よい高さ）から開始
  let prevNote = scaleNotes[Math.floor(scaleNotes.length / 2)]; 

  // 全4コード。各コードごとに4つのスロット（8分音符単位で計16スロット）
  for (let c = 0; c < 4; c++) {
    const chordNotes = chordProgression.chords[c];

    for (let s = 0; s < 4; s++) {
      // 1. 休符（音を間引く）の抽選
      const isRest = (s === 3 && Math.random() < 0.35) || (s === 1 && Math.random() < 0.2);
      if (isRest) {
        melodyPattern.push(null);
        continue;
      }

      // 2. 候補となる音を決定（前回の音のインデックスから -1, 0, +1 の範囲に限定＝なだらかな進行）
      const scaleIdx = scaleNotes.indexOf(prevNote);
      const candidates = [];
      
      if (scaleIdx !== -1) {
        for (let offset of [-1, 0, 1]) {
          const idx = scaleIdx + offset;
          if (idx >= 0 && idx < scaleNotes.length) {
            candidates.push(scaleNotes[idx]);
          }
        }
      } else {
        // 万が一見つからなければ、スケールの中心付近を候補にする
        const mid = Math.floor(scaleNotes.length / 2);
        candidates.push(scaleNotes[mid]);
      }

      // 3. 拍の頭（s === 0）では、候補の中から「コードトーン（和音の構成音）」を優先的に選んで調和させる
      let chosenNote = null;
      if (s === 0 && Math.random() < 0.85) {
        const chordPitches = chordNotes.map(n => n % 12);
        const chordTonesInCandidates = candidates.filter(note => chordPitches.includes(note % 12));
        
        if (chordTonesInCandidates.length > 0) {
          chosenNote = chordTonesInCandidates[Math.floor(Math.random() * chordTonesInCandidates.length)];
        }
      }

      // 4. 優先選択されなかった場合は、候補（隣り合う音）からランダムに選択
      if (!chosenNote) {
        chosenNote = candidates[Math.floor(Math.random() * candidates.length)];
      }

      melodyPattern.push(chosenNote);
      prevNote = chosenNote;
    }
  }
  return melodyPattern;
}

function playRewardLoop() {
  if (!isRewardPlaying) return;

  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  isPlaying = true;

  // 1. 現在のキーに適したリードスケール音（MIDIノート）の生成
  const progressionKey = KEYS.easy.find(k => k.name === currentProgression.keyName) || KEYS.easy[0];
  const root = progressionKey.root;
  const isMinor = progressionKey.type === 'minor';

  // 音階ステップ (ダイアトニックスケール：メジャーは全7音 / マイナーは全7音)
  const scaleSteps = isMinor ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
  const leadRoot = root + 12; // C3をC4にオクターブアップしてリード音域に
  const scaleNotes = [];
  
  // 2オクターブ分の音階ノートを生成
  scaleSteps.forEach(step => scaleNotes.push(leadRoot + step));
  scaleSteps.forEach(step => scaleNotes.push(leadRoot + 12 + step));

  // 2. メロディラインをリアルタイム自動生成
  const melody = generateMelodyPattern(scaleNotes, currentProgression);

  const stepTime = 1.32; // 1コードの時間
  const slotTime = 0.33; // 8分音符スロットの時間 (1.32 / 4)

  // 伴奏とベースのスケジュール (計5.28秒分)
  for (let i = 0; i < 4; i++) {
    const chordStart = now + i * stepTime;
    const chordNotes = currentProgression.chords[i];
    const step = currentProgression.sequence[i];

    // 伴奏コード
    playChord(chordNotes, chordStart, stepTime - 0.1, 0.4);

    // ベース音
    const stringData = FRET_NOTES[step.string].find(f => f.fret === step.fret);
    if (stringData) {
      playBassTone(midiNoteToFreq(stringData.note), chordStart, stepTime - 0.05, 0.3);
    }
  }

  // リアルタイム色分け用タイマースケジュール
  rewardColorTimeoutIds.forEach(id => clearTimeout(id));
  rewardColorTimeoutIds = [];
  
  for (let i = 0; i < 4; i++) {
    const delayMs = i * stepTime * 1000;
    const tid = setTimeout(() => {
      currentChordIndex = i;
      updateAdlibFretboardColors(i);
    }, delayMs);
    rewardColorTimeoutIds.push(tid);
  }

  // 3. リズム（8ビート）＆自動メロディ（16スロット）のスケジュール
  for (let s = 0; s < 16; s++) {
    const playTime = now + s * slotTime;

    // --- 本格ドラムリズム (8ビート) ---
    // キック: ドン (s=0, s=8, s=10)
    if (s === 0 || s === 8 || s === 10) {
      playKickBeat(playTime);
    }
    // スネア: タ (s=4, s=12)
    if (s === 4 || s === 12) {
      playSnareBeat(playTime);
    }
    // ハイハット: チ
    if (s % 2 === 0) {
      playHatBeat(playTime, 0.05); // 表拍
    } else {
      playHatBeat(playTime, 0.02); // 裏拍
    }

    // --- 自動生成メロディの再生 (自動演奏モード時のみ) ---
    if (rewardPlayMode === 'auto') {
      const note = melody[s];
      if (note !== null) {
        const freq = midiNoteToFreq(note);
        const duration = 0.28;
        const tones = playLeadTone(freq, playTime, duration, 0.05);
        if (tones) {
          autoMelodyOscillators.push(...tones.oscillators);
          autoMelodyGainNodes.push(...tones.gains);
        }

        // 指板上の対応する音をリアルタイム発光させる (JSスレッドで同期)
        const delayMs = s * slotTime * 1000;
        const flashTid = setTimeout(() => {
          flashAdlibFretboardNode(note);
        }, delayMs);
        rewardColorTimeoutIds.push(flashTid);

        // 時たま（約30%の確率）8分音符の裏拍（slotTime / 2 = 0.165秒後）を挟む
        // 最後のスロット (s === 15) は次のループとの競合を防ぐため避ける
        const isOffbeat = Math.random() < 0.3;
        if (isOffbeat && s < 15) {
          const offbeatTime = playTime + slotTime / 2;
          
          // 音高の決定: 50%で同音連打、50%で隣り合うスケール音
          let offbeatNote = note;
          if (Math.random() < 0.5) {
            const scaleIdx = scaleNotes.indexOf(note);
            if (scaleIdx !== -1) {
              const shift = Math.random() < 0.5 ? -1 : 1;
              const targetIdx = scaleIdx + shift;
              if (targetIdx >= 0 && targetIdx < scaleNotes.length) {
                offbeatNote = scaleNotes[targetIdx];
              }
            }
          }

          const offbeatFreq = midiNoteToFreq(offbeatNote);
          // 裏拍なので少し短め・弱めで発音
          const offbeatTones = playLeadTone(offbeatFreq, offbeatTime, 0.14, 0.03);
          if (offbeatTones) {
            autoMelodyOscillators.push(...offbeatTones.oscillators);
            autoMelodyGainNodes.push(...offbeatTones.gains);
          }

          // 裏拍の音も指板上で光らせる
          const offbeatDelayMs = (s * slotTime + slotTime / 2) * 1000;
          const flashOffTid = setTimeout(() => {
            flashAdlibFretboardNode(offbeatNote);
          }, offbeatDelayMs);
          rewardColorTimeoutIds.push(flashOffTid);
        }
      }
    }
  }

  // 5.28秒後に次のループを自動再生
  const loopTotalDuration = 5.28;
  rewardLoopTimeoutId = setTimeout(() => {
    playRewardLoop();
  }, loopTotalDuration * 1000);
}

// ==========================================================================
// タブ・UI制御イベント初期化
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // セーブデータの読み込みと初期適用
  loadGameData();

  const tabLearn = document.getElementById('tab-learn');
  const tabChallenge = document.getElementById('tab-challenge');
  const tabBaseline = document.getElementById('tab-baseline');
  
  const learnCard = document.getElementById('learn-card');
  const challengeCard = document.getElementById('challenge-card');
  const baselineCard = document.getElementById('baseline-card');

  tabLearn.addEventListener('click', () => {
    if (activeTab === 'learn') return;
    stopAllAudio();
    stopBattleTimer();
    activeTab = 'learn';
    tabLearn.classList.add('active');
    tabChallenge.classList.remove('active');
    tabBaseline.classList.remove('active');
    
    learnCard.style.display = 'flex';
    challengeCard.style.display = 'none';
    baselineCard.style.display = 'none';
    
    if (activeStep === 'resolve') {
      initResolveQuestion();
    } else {
      initFindTonicQuestion();
    }
  });

  tabChallenge.addEventListener('click', () => {
    if (activeTab === 'challenge') return;
    stopAllAudio();
    stopBattleTimer();
    activeTab = 'challenge';
    tabChallenge.classList.add('active');
    tabLearn.classList.remove('active');
    tabBaseline.classList.remove('active');
    
    challengeCard.style.display = 'flex';
    learnCard.style.display = 'none';
    baselineCard.style.display = 'none';
    
    initChallengeQuestion();
  });

  tabBaseline.addEventListener('click', () => {
    if (activeTab === 'baseline') return;
    stopAllAudio();
    stopBattleTimer();
    activeTab = 'baseline';
    tabBaseline.classList.add('active');
    tabLearn.classList.remove('active');
    tabChallenge.classList.remove('active');
    
    baselineCard.style.display = 'flex';
    learnCard.style.display = 'none';
    challengeCard.style.display = 'none';
    
    // 討伐タブをクリックした際はまずロビーを表示
    updateLobbyUI();
    showRpgScreen('baseline-lobby');
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

  // --- 🎸 モンスター討伐モードのイベントリスナー ---
  document.getElementById('btn-play-baseline').addEventListener('click', playBaselineSequence);
  document.querySelectorAll('.fret-node').forEach(node => {
    node.addEventListener('click', () => handleFretboardTrigger(node));
  });

  // ロビー・ショップ・リザルトのボタンリスナー
  document.getElementById('btn-upgrade-hp').addEventListener('click', () => upgradeStat('hp'));
  document.getElementById('btn-upgrade-atk').addEventListener('click', () => upgradeStat('atk'));
  document.getElementById('btn-upgrade-time').addEventListener('click', () => upgradeStat('time'));
  
  document.getElementById('btn-start-run').addEventListener('click', startRpgRun);
  document.getElementById('btn-start-free-session').addEventListener('click', startFreeSession);
  document.getElementById('btn-skip-reward').addEventListener('click', stopRewardPhase);
  document.getElementById('btn-go-lobby').addEventListener('click', () => {
    updateLobbyUI();
    showRpgScreen('baseline-lobby');
  });

  // --- ご褒美アドリブ演奏のイベントリスナー ---
  const btnToggle = document.getElementById('btn-reward-mode-toggle');
  if (btnToggle) {
    btnToggle.addEventListener('click', toggleRewardMode);
  }

  document.querySelectorAll('.adlib-fret-node').forEach(node => {
    node.addEventListener('click', () => handleAdlibFretboardTrigger(node));
  });

  // --- チャレンジモード의 イベントリスナー ---
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

  // 初期化時はラーニング（ステップ1）で起動
  initResolveQuestion();
});
