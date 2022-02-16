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

document.addEventListener('DOMContentLoaded', function () {
  init();
}, false);

async function init() {
  playBtn = document.getElementById("playBtn");
  switchBtn = document.getElementById("switchBtn");
  currentWord = document.getElementById("currentWord");
  source = document.getElementById("source");
  player = document.getElementById("player");
  selectVocabularyElement = document.getElementById('selectVocabulary');
  repeatNumber = parseInt(document.getElementById("repeatNumber").value);
  interval = parseInt(document.getElementById("interval").value);
  remainingRepeatNumber = repeatNumber;
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
}

function onIntervalChange() {
  interval = parseInt(document.getElementById("interval").value);
}

function resetProgress() {
  vocabulary.progress = 0;
}

function back() {
  vocabulary.progress -= 2;
  if (vocabulary.progress < 0) vocabulary.progress = 0;
}