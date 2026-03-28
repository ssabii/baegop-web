#!/bin/bash

SESSION="baegop"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# 이미 세션이 있으면 attach
if tmux has-session -t "$SESSION" 2>/dev/null; then
  tmux attach-session -t "$SESSION"
  exit 0
fi

# 새 세션 생성 (좌측 패인)
tmux new-session -d -s "$SESSION" -c "$PROJECT_DIR"

# 우측 패인 분할 (33% = 4/12)
tmux split-window -h -p 33 -t "$SESSION" -c "$PROJECT_DIR"

# 우측 패인을 상하 분할
tmux split-window -v -t "$SESSION" -c "$PROJECT_DIR"

# 우상 패인(pane 1)에 pnpm dev 실행
tmux send-keys -t "$SESSION:0.1" "pnpm dev" C-m

# 좌측 패인(pane 0)에 claude 실행
tmux send-keys -t "$SESSION:0.0" "claude" C-m

# 좌측 패인 포커스
tmux select-pane -t "$SESSION:0.0"

# attach
tmux attach-session -t "$SESSION"
