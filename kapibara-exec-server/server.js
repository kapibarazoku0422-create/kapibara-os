const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// public フォルダを公開
app.use(express.static(path.join(__dirname, 'public')));

// 実行中のプロセス管理
const running = new Map();

// ===== ping =====
app.get('/ping', (req, res) => {
  res.json({
    status: 'ok',
    os: 'kapibara OS exec server',
    time: new Date().toISOString()
  });
});

// ===== コード実行 =====
app.post('/exec', (req, res) => {
  const { lang, code, timeout = 15000 } = req.body;

  if (!lang || !code) {
    return res.status(400).json({
      error: 'lang と code が必要です'
    });
  }

  const commands = {
    node: `node -e ${JSON.stringify(code)}`,
    python3: `python3 -c ${JSON.stringify(code)}`,
    bash: `bash -c ${JSON.stringify(code)}`
  };

  const cmd = commands[lang];

  if (!cmd) {
    return res.status(400).json({
      error: `未対応の言語: ${lang}`
    });
  }

  const pid = Date.now();

  const proc = exec(
    cmd,
    {
      timeout,
      maxBuffer: 512 * 1024
    },
    (err, stdout, stderr) => {
      running.delete(pid);

      if (err && err.killed) {
        return res.json({
          stdout: stdout || '',
          stderr: '実行タイムアウト (15秒)',
          error: null
        });
      }

      res.json({
        stdout: stdout || '',
        stderr: stderr || '',
        error: err ? err.message : null
      });
    }
  );

  running.set(pid, proc);
});

// ===== 実行中プロセス一覧 =====
app.get('/processes', (req, res) => {
  res.json({
    count: running.size,
    pids: [...running.keys()]
  });
});

// ===== プロセス停止 =====
app.delete('/processes/:pid', (req, res) => {
  const pid = parseInt(req.params.pid);

  if (running.has(pid)) {
    running.get(pid).kill();
    running.delete(pid);

    res.json({
      killed: pid
    });
  } else {
    res.status(404).json({
      error: 'not found'
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`kapibara exec server running on :${PORT}`);
});
