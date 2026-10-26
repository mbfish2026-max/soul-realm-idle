# 合成音频

普通 script，零请求、无外部音频。加载 `score.js` 后加载 `audio.js`，调用 `SR.audio2.install()`。
完整接线说明见 `docs/report-i-audio.md`，公共接口提案见 `docs/interfaces.md` 末尾。

音乐：`setScene('town'|'field'|'boss')`。音效：`play(id)` 或 `SR.bus.emit('sfx',{id:...})`。

| id | 声音 |
|---|---|
| skill_wind | 笛音上行 |
| skill_fire | 低起拨弦爆发 |
| skill_earth | 低鼓三击 |
| skill_moon | 高音泛弦 |
| pet_attack | 双音拨弦 |
| boss_warning | 三次低鼓 |
| absorb_success / absorb_fail | 上行五音 / 下行三音 |
| level_up / fusion | 上行庆贺 / 共鸣和声 |
| drop_white/yellow/purple/black/red | 随品质增加的 1–5 音 |
| ui_click | 短促高音 |

旧调用别名：click、attack、skill、pet、boss、absorb、upgrade。未知 id 静默返回 false。
相同 id 90ms 去重，单上下文最多 96 个主发声节点；不使用游戏随机数，不影响掉落序列。

`getSettings()` 返回副本；`setSettings({master,music,sfx,muted})` 只改传入字段，数值限定 0..1，非有限值忽略。
`mountSettings(el)` 清空目标并挂三条音量滑杆及静音复选框。
`openSettings()` 在 body 挂独立弹窗，完成、空白、Escape 关闭，含键盘焦点循环和关闭后焦点恢复。
`uninstall()` 注销模块监听与调度、销毁声音弹窗、停止发声并关闭上下文；宿主嵌入的设置容器由宿主管理。
