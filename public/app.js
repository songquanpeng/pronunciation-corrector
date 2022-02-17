let playBtn;
let switchBtn;
let currentWord;
let source;
let player;
let shouldStop = false;
let isPlaying = false;
let type = 0;  // 0 means us, 1 means uk
let switched = false;
let vocabulary;
let vocabularyName = null;
let vocabularies;
let repeatNumber;
let remainingRepeatNumber;
let interval;
let selectVocabularyElement;
let progressBar;
let delay;
let whichVoice;
let skipTimeout;
let timeout;

document.addEventListener('DOMContentLoaded', function () {
  init();
}, false);

async function init() {
  playBtn = document.getElementById("playBtn");
  switchBtn = document.getElementById("switchBtn");
  currentWord = document.getElementById("currentWord");
  source = document.getElementById("source");
  player = document.getElementById("player");
  progressBar = document.getElementById('progressBar');
  selectVocabularyElement = document.getElementById('selectVocabulary');
  whichVoice = localStorage.getItem('whichVoice');
  if (!whichVoice) {
    whichVoice = "youdao";
    localStorage.setItem("whichVoice", whichVoice);
  }
  document.getElementById('whichVoice').value = whichVoice;
  repeatNumber = parseInt(localStorage.getItem('repeatNumber'));
  if (!repeatNumber) {
    repeatNumber = 1;
    localStorage.setItem('repeatNumber', repeatNumber);
  }
  document.getElementById("repeatNumber").value = repeatNumber;
  remainingRepeatNumber = repeatNumber;
  interval = parseInt(localStorage.getItem('interval'));
  if (!interval) {
    interval = 100;
    localStorage.setItem('interval', interval);
  }
  document.getElementById("interval").value = interval;
  delay = parseInt(localStorage.getItem('delay'));
  if (!delay) {
    delay = 0;
    localStorage.setItem('delay', delay);
  }
  document.getElementById("delay").value = delay;
  timeout = parseInt(localStorage.getItem('timeout'));
  if (!timeout) {
    timeout = 3000;
    localStorage.setItem('timeout', timeout);
  }
  document.getElementById("timeout").value = timeout;
  vocabularies = await loadVocabularies();
  vocabularyName = localStorage.getItem('vocabularyName');
  if (vocabularyName) {
    selectVocabularyElement.value = vocabularyName;
    vocabulary = await loadVocabulary(vocabularyName);
  }

  player.addEventListener("ended", playEnded);
}


async function loadVocabularies() {
  let res = await fetch(`config.json`);
  let vocabularies = await res.json();
  let html = ""
  for (const [key, value] of Object.entries(vocabularies)) {
    console.log(`${key}: ${value}`);
    html += `<option value="${key}">${value}</option>`
  }
  selectVocabularyElement.innerHTML = html;
  return vocabularies;
}


async function loadVocabulary(name) {
  let vocabulary = localStorage.getItem(`vocabulary-${name}`);
  if (vocabulary === null) {
    let res = await fetch(`vocabulary/${name}.json`);
    vocabulary = await res.json();
    vocabulary.progress = 0;
  } else {
    vocabulary = JSON.parse(vocabulary);
  }
  return vocabulary;
}

function playBtnClicked() {
  if (isPlaying) {
    playBtn.textContent = "播放";
    shouldStop = true;
    isPlaying = !isPlaying;
  } else {
    playBtn.textContent = "停止";
    shouldStop = false;
    isPlaying = !isPlaying;
    play();
  }
}

function switchType() {
  type++;
  type %= 2;
  switchBtn.textContent = `${type === 0 ? "美音" : "英音"}`;
  switched = true;
}

async function play() {
  if (shouldStop) return;
  if (vocabularyName === null) {
    await onSelectVocabularyChange();
  }

  let word = vocabulary.words[vocabulary.progress].word;
  if (remainingRepeatNumber === repeatNumber) {
    currentWord.innerText = word;
    source.setAttribute('src', getAudioURL(word));
    await player.load();
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  remainingRepeatNumber--;
  skipTimeout = setTimeout(playEnded, timeout);
  await player.play();  // if the player failed to load the audio, it will block here.
}

async function playEnded() {
  if (skipTimeout) clearTimeout(skipTimeout);
  if (remainingRepeatNumber <= 0) {
    remainingRepeatNumber = repeatNumber;
    vocabulary.progress++;
    if (vocabulary.progress === vocabulary.words.length) {
      vocabulary.progress = 0;
    }
    localStorage.setItem(`vocabulary-${vocabularyName}`, JSON.stringify(vocabulary));
    progressBar.value = vocabulary.progress;
    progressBar.max = vocabulary.words.length;
  }
  setTimeout(play, interval);
}


async function onSelectVocabularyChange() {
  vocabularyName = selectVocabularyElement.value;
  vocabulary = await loadVocabulary(vocabularyName);
  localStorage.setItem('vocabularyName', vocabularyName);
}

function onWhichVoiceChange() {
  whichVoice = document.getElementById('whichVoice').value;
  localStorage.setItem('whichVoice', whichVoice);
}

function onRepeatNumberChange() {
  repeatNumber = parseInt(document.getElementById("repeatNumber").value);
  localStorage.setItem('repeatNumber', repeatNumber);
}

function onIntervalChange() {
  interval = parseInt(document.getElementById("interval").value);
  localStorage.setItem('interval', interval);
}

function onDelayChange() {
  delay = parseInt(document.getElementById("delay").value);
  localStorage.setItem('delay', delay);
}

function resetProgress() {
  vocabulary.progress = 0;
}

function back() {
  vocabulary.progress -= 2;
  if (vocabulary.progress < 0) vocabulary.progress = 0;
}

function getAudioURL(word) {
  let url;
  switch(whichVoice) {
    case "google":
      let typeStr = type === 0 ? "us" : "gb";
      word = word.toLowerCase();
      url = `https://ssl.gstatic.com/dictionary/static/sounds/oxford/${word}--_${typeStr}_1.mp3`;
      break;
    default:
      url = `https://dict.youdao.com/dictvoice?type=${type}&audio=${word}`;
      break;
  }
  return url;
}

function onTimeoutChange() {
  timeout = parseInt(document.getElementById("timeout").value);
  localStorage.setItem('timeout', timeout);
}