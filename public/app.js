let playBtn;
let switchBtn;
let currentWord;
let source;
let player;
let shouldStop = false;
let isPlaying = false;
let type = 0;
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
  } else {
    playBtn.textContent = "停止";
    shouldStop = false;
    play();
  }
  isPlaying = !isPlaying;
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
    source.setAttribute('src', `https://dict.youdao.com/dictvoice?type=${type}&audio=${word}`);
    await player.load();
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  await player.play();
  remainingRepeatNumber--;
}

async function playEnded() {
  if (remainingRepeatNumber === 0) {
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