import React, { useEffect, useState } from 'react';
import { Form, Grid, Progress, Segment } from 'semantic-ui-react';
import { API, showError } from '../../helpers';
import './index.css';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [learning, setLearning] = useState(false);
  const [words, setWords] = useState([]);
  const [list, setList] = useState([]);
  const [lists, setLists] = useState([]);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [currentListIdx, setCurrentListIdx] = useState(0);
  const [currentSoundSrc, setCurrentSoundSrc] = useState('youdao');
  const [setting, setSetting] = useState({
    repeatNum: 1,
    repeatInterval: 100,
    playDelay: 0,
    timeout: 3000,
  });

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
    parseList(0);
    setLoading(false);
  };

  const parseList = (idx) => {
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
    setList(list);
  };

  const onListChange = async (e, data) => {
    setCurrentListIdx(data.value);
    parseList(data.value);
  };

  useEffect(() => {
    loadData().then();
  }, []);

  return (
    <Segment
      style={{
        maxWidth: '930px',
        margin: 'auto',
        marginTop: '16px',
        marginBottom: '48px',
      }}
      className={'main-container'}
    >
      <Grid columns={2} stackable>
        <Grid.Column style={{ padding: '1.25rem' }}>
          <label className="card-title">当前单词</label>
          <div className={'word-container'}>
            <p className={'word'}>
              {loading
                ? '加载中，请稍后 ...'
                : learning
                ? words[list[currentWordIdx] - 1].text
                : '请点击播放按钮 ...'}
            </p>
          </div>
          <Progress
            size={'small'}
            value={currentWordIdx}
            total={words.length}
            color="green"
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
                { key: 'baidu', text: '百度', value: 'baidu' },
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
                value={setting.repeatNum}
              />
              <Form.Input
                fluid
                label="复读间隔"
                type="number"
                placeholder={100}
                min={0}
                step={10}
                value={setting.repeatInterval}
              />
              <Form.Input
                fluid
                label="发音延迟"
                type="number"
                placeholder={0}
                min={0}
                step={100}
                value={setting.playDelay}
              />
              <Form.Input
                fluid
                label="超时时间"
                type="number"
                placeholder={3000}
                min={1000}
                step={100}
                value={setting.timeout}
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
              >
                美音
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
                onClick={() => {
                  setLearning(!learning);
                }}
              >
                {learning ? '暂停' : '播放'}
              </Form.Button>
            </Form.Group>
          </Form>
        </Grid.Column>
      </Grid>
    </Segment>
  );
};

export default Home;
