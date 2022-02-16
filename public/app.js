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
let vocabularyName = "common-3000";
let repeatNumber;
let remainingRepeatNumber;
let interval;

document.addEventListener('DOMContentLoaded', function () {
  init();
}, false);

async function init() {
  playBtn = document.getElementById("playBtn");
  switchBtn = document.getElementById("switchBtn");
  currentWord = document.getElementById("currentWord");
  source = document.getElementById("source");
  player = document.getElementById("player");
  repeatNumber = parseInt(document.getElementById("repeatNumber").value);
  interval = parseInt(document.getElementById("interval").value);
  remainingRepeatNumber = repeatNumber;
  vocabulary = await loadVocabulary(vocabularyName);

  player.addEventListener("ended", playEnded);
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
  let word = vocabulary.words[vocabulary.progress].word;
  if (remainingRepeatNumber === repeatNumber) {
    currentWord.value = word;
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
