import React, { useEffect, useState } from 'react';
import { Form, Grid, Progress, Segment } from 'semantic-ui-react';
import { API, showError, showNotice } from '../../helpers';
import './index.css';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [learning, setLearning] = useState(false);
  const [words, setWords] = useState([]);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);

  const loadData = async () => {
    const res = await API.get('/api/notice');
    const { success, message, data } = res.data;
    if (success) {
      let oldNotice = localStorage.getItem('notice');
      if (data !== oldNotice && data !== '') {
        showNotice(data);
        localStorage.setItem('notice', data);
      }
    } else {
      showError(message);
    }
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
                ? words[currentWordIdx]
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
              options={[
                { key: 'm', text: 'EF 常用 3000 词汇', value: 'male' },
                {
                  key: 'f',
                  text: '中国程序员容易发音错误的单词',
                  value: 'female',
                },
                { key: 'o', text: '计算机科学词汇表', value: 'other' },
              ]}
              placeholder="Gender"
            />
            <Form.Select
              fluid
              label="当前音源"
              options={[
                { key: 'm', text: '有道', value: 'male' },
                { key: 'o', text: 'Google', value: 'other' },
              ]}
              placeholder="Gender"
            />
            <Form.Group widths="equal">
              <Form.Input
                fluid
                label="复读次数"
                type="number"
                min={0}
                placeholder={1}
              />
              <Form.Input
                fluid
                label="复读间隔"
                type="number"
                placeholder={100}
                min={0}
                step={10}
              />
              <Form.Input
                fluid
                label="发音延时"
                type="number"
                placeholder={0}
                min={0}
                step={100}
              />
              <Form.Input
                fluid
                label="超时设置"
                type="number"
                placeholder={3000}
                min={1000}
                step={100}
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
              >
                播放
              </Form.Button>
            </Form.Group>
          </Form>
        </Grid.Column>
      </Grid>
    </Segment>
  );
};

export default Home;
