import React, { useEffect, useRef, useState } from 'react';
import { Form, Grid, Progress, Segment } from 'semantic-ui-react';
import { API, showError } from '../../helpers';
import './index.css';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const playingRef = useRef(playing);
  playingRef.current = playing;
  const [words, setWords] = useState([]);
  const [list, setList] = useState([]);
  const listRef = useRef(list);
  listRef.current = list;
  const [lists, setLists] = useState([]);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const currentWordIdxRef = useRef(currentWordIdx);
  currentWordIdxRef.current = currentWordIdx;
  const [percent, setPercent] = useState(0);
  const percentRef = useRef(percent);
  percentRef.current = percent;
  const [currentWord, setCurrentWord] = useState({
    id: 0,
    text: '',
    ipa: '',
    explanation: '',
  });
  const [currentListIdx, setCurrentListIdx] = useState(0);
  const currentListIdxRef = useRef(currentListIdx);
  currentListIdxRef.current = currentListIdx;
  const [currentSoundSrc, setCurrentSoundSrc] = useState('youdao');
  const currentSoundSrcRef = useRef(currentSoundSrc);
  currentSoundSrcRef.current = currentSoundSrc;
  const [soundType, setSoundType] = useState(0);
  const soundTypeRef = useRef(soundType);
  soundTypeRef.current = soundType;
  const [setting, setSetting] = useState({
    repeatNumber: 1,
    repeatInterval: 1000,
    playDelay: 0,
    timeout: 3000,
  });
  const settingRef = useRef(setting);
  settingRef.current = setting;
  const [remainingRepeatNumber, setRemainingRepeatNumber] = useState(
    setting.repeatNumber
  );
  const remainingRepeatNumberIdxRef = useRef(remainingRepeatNumber);
  remainingRepeatNumberIdxRef.current = remainingRepeatNumber;
  let player = document.getElementById('player');
  let source = document.getElementById('source');
  let skipTimeout;

  const loadAvailableLists = async () => {
    let lists = localStorage.getItem('lists');
    if (lists) {
      lists = JSON.parse(lists);
    } else {
      const res = await API.get('/api/list/available');
      const { success, message, data } = res.data;
      if (!success) {
        showError(message);
        return;
      }
      lists = [];
      data.forEach((item, idx) => {
        lists.push({
          key: item.id,
          text: item.name,
          value: idx,
          origin: item,
        });
      });
      localStorage.setItem('lists', JSON.stringify(lists));
    }
    setLists(lists);
  };

  const loadWords = async () => {
    let words = localStorage.getItem('words');
    if (words) {
      words = JSON.parse(words);
    } else {
      const res = await API.get(`/api/word?offset=${0}&limit=${10000}`);
      const { success, message, data } = res.data;
      if (!success) {
        showError(message);
        return;
      }
      words = data;
      localStorage.setItem('words', JSON.stringify(words));
    }
    setWords(words);
  };

  const loadData = async () => {
    setLoading(true);
    await loadAvailableLists();
    await loadWords();
  };

  useEffect(() => {
    parseList(0);
    setLoading(false);
  }, [lists]);

  const parseList = (idx) => {
    console.log(
      'parseList() called with idx',
      idx,
      'lists.length',
      lists.length
    );
    if (lists.length <= idx) return;
    let words = lists[idx].origin.words;
    let binaryWords = window.atob(words);
    let list = [];
    for (let i = 0; i < binaryWords.length; i++) {
      let byte = binaryWords.charCodeAt(i);
      for (let j = 0; j < 8; j++) {
        if (byte & (1 << (7 - j))) {
          list.push(i * 8 + j);
        }
      }
    }
    console.log('setting list: ', list);
    setList(list);
    setCurrentWordIdx(0);
  };

  const onListChange = async (e, data) => {
    setCurrentListIdx(data.value);
    parseList(data.value);
  };

  const getAudioURL = (text) => {
    let url;
    let typeStr;
    switch (currentSoundSrcRef.current) {
      case 'google':
        typeStr = soundTypeRef.current === 0 ? 'us' : 'gb';
        text = text.toLowerCase();
        url = `https://ssl.gstatic.com/dictionary/static/sounds/oxford/${text}--_${typeStr}_1.mp3`;
        break;
      default:
        url = `https://dict.youdao.com/dictvoice?type=${soundTypeRef.current}&audio=${text}`;
        break;
    }
    return url;
  };

  const play = async () => {
    console.log('play() called, playing is', playingRef.current);
    if (!playingRef.current) return;

    // load word
    let currentWord = words[listRef.current[currentWordIdxRef.current] - 1];
    console.log(currentWordIdxRef.current, currentWord);
    setCurrentWord(currentWord);

    if (
      remainingRepeatNumberIdxRef.current === settingRef.current.repeatNumber
    ) {
      let audioURL = getAudioURL(currentWord.text);
      source.setAttribute('src', audioURL);
      await player.load();
      await new Promise((resolve) =>
        setTimeout(resolve, settingRef.current.playDelay)
      );
    }
    setRemainingRepeatNumber(remainingRepeatNumberIdxRef.current - 1);
    skipTimeout = setTimeout(playEnded, settingRef.current.timeout);
    await player.play(); // if the player failed to load the audio, it will block here.
  };

  const playEnded = async () => {
    console.log(
      'playEnded() called, remainingRepeatNumber ',
      remainingRepeatNumberIdxRef.current
    );
    if (skipTimeout) clearTimeout(skipTimeout);
    if (remainingRepeatNumberIdxRef.current <= 0) {
      setRemainingRepeatNumber(settingRef.current.repeatNumber);
      if (currentWordIdxRef.current === listRef.current.length - 1) {
        console.log('reset currentWordIdx to 0');
        setCurrentWordIdx(0);
      } else {
        console.log(
          'increase currentWordIdx to',
          currentWordIdxRef.current + 1
        );
        setCurrentWordIdx(currentWordIdxRef.current + 1);
      }
      setPercent(
        Math.ceil((100 * currentWordIdxRef.current) / listRef.current.length)
      );
    }
    if (playingRef.current) {
      setTimeout(play, settingRef.current.repeatInterval);
    }
  };

  const onPlayBtnClicked = () => {
    if (words.length === 0 || lists.length === 0 || list.length === 0) {
      if (words.length === 0) {
        showError('无法开始播放，words 长度为 0！');
      }
      if (lists.length === 0) {
        showError('无法开始播放，lists 长度为 0！');
      }
      if (list.length === 0) {
        showError('无法开始播放，list 长度为 0！');
      }
      return;
    }
    setPlaying((v) => !v);
  };

  useEffect(() => {
    if (playing) {
      play().then();
    }
  }, [playing]);

  useEffect(() => {
    loadData().then();
  }, []);

  const handleSettingChange = (e, { name, value }) => {
    setSetting((setting) => ({ ...setting, [name]: value }));
  };

  const backward = () => {
    setCurrentWordIdx(Math.max(0, currentWordIdx - 2));
  };

  const reset = () => {
    setCurrentWordIdx(0);
  };

  return (
    <Segment
      loading={loading}
      style={{
        maxWidth: '930px',
        margin: 'auto',
        marginTop: '16px',
        marginBottom: '48px',
      }}
      className={'main-container'}
    >
      <audio controls style={{ display: 'none' }} id="player">
        <source src="" type="audio/mpeg" id="source" />
      </audio>
      <Grid columns={2} stackable>
        <Grid.Column style={{ padding: '1.25rem' }}>
          <label className="card-title">当前单词</label>
          <div className={'word-container'}>
            <p className={'word'}>
              {loading
                ? '加载中，请稍后 ...'
                : playing
                ? currentWord.text
                : '请点击播放按钮 ...'}
            </p>
          </div>
          <Progress
            size={'small'}
            percent={percent}
            color="green"
            progress="percent"
          />
        </Grid.Column>
        <Grid.Column style={{ padding: '1.25rem' }}>
          <Form>
            <Form.Select
              fluid
              label="当前词库"
              options={lists}
              value={currentListIdx}
              onChange={onListChange}
            />
            <Form.Select
              fluid
              label="当前音源"
              options={[
                { key: 'youdao', text: '有道', value: 'youdao' },
                { key: 'google', text: 'Google', value: 'google' },
                // { key: 'baidu', text: '百度', value: 'baidu' },
              ]}
              value={currentSoundSrc}
              onChange={(e, data) => {
                setCurrentSoundSrc(data.value);
              }}
            />
            <Form.Group widths="equal">
              <Form.Input
                fluid
                label="复读次数"
                type="number"
                min={0}
                placeholder={1}
                name="repeatNumber"
                value={setting.repeatNumber}
                onChange={handleSettingChange}
              />
              <Form.Input
                fluid
                label="复读间隔"
                type="number"
                placeholder={100}
                min={0}
                step={10}
                name="repeatInterval"
                value={setting.repeatInterval}
                onChange={handleSettingChange}
              />
              <Form.Input
                fluid
                label="发音延迟"
                type="number"
                placeholder={0}
                min={0}
                step={100}
                name="playDelay"
                value={setting.playDelay}
                onChange={handleSettingChange}
              />
              <Form.Input
                fluid
                label="超时时间"
                type="number"
                placeholder={3000}
                min={1000}
                step={100}
                name="timeout"
                value={setting.timeout}
                onChange={handleSettingChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Button
                size="large"
                style={{
                  color: '#000000B3',
                  backgroundColor: '#FFDC7D',
                  fontWeight: 400,
                  padding: '12px 16px',
                  marginRight: 0,
                }}
                onClick={reset}
              >
                重置
              </Form.Button>
              <Form.Button
                size="large"
                style={{
                  color: '#000000B3',
                  backgroundColor: '#F5F5F5',
                  fontWeight: 400,
                  padding: '12px 16px',
                  marginRight: 0,
                }}
                onClick={backward}
              >
                后退
              </Form.Button>
              <Form.Button
                size="large"
                style={{
                  color: '#000000B3',
                  backgroundColor: '#F5F5F5',
                  fontWeight: 400,
                  padding: '12px 16px',
                  marginRight: 0,
                }}
                onClick={() => {
                  setSoundType((v) => (v + 1) % 2);
                }}
              >
                {soundType === 0 ? '美音' : '英音'}
              </Form.Button>
              <Form.Button
                size="large"
                style={{
                  color: '#fff',
                  backgroundColor: '#3EC487',
                  fontWeight: 400,
                  padding: '12px 16px',
                  marginRight: 0,
                }}
                onClick={onPlayBtnClicked}
              >
                {playing ? '暂停' : '播放'}
              </Form.Button>
            </Form.Group>
          </Form>
        </Grid.Column>
      </Grid>
    </Segment>
  );
};

export default Home;
