# 合成音频

加载 `audio/sfx.js` 后加载 `audio/bgm.js`。无外部音频，无运行时依赖。
借鉴 idle-arpg/audio.js 的合成包络与前瞻调度思路；本实现不包装其他路函数、不修改存档。

`SR.bus.emit('sfx', {id:'attack'})` 或 `SR.audio.play('attack')`。
总线在脚本加载时绑定；若稍后才建立总线，调用 `SR.audio.bindBus()`。直接调用始终可用。

| id | 用途 |
|---|---|
| attack | 普攻挥剑 |
| skill | 轮技 |
| crit | 暴击 |
| hit | 受击 |
| pickup | 拾取 |
| absorb_success | 魂环吸收成功 |
| absorb_fail | 魂环吸收失败 |
| levelup | 升级 |
| click | 按钮 |

`SR.audio.setEnabled(bool)` / `setVolume(0..1)` / `getVolume()` / `isUnlocked()`。
未知 id、解锁前、后台或静音时 `play` 返回 false，声音不排队。
AudioContext 只在可信 pointerdown/touchend/keydown 事件后建立并恢复；手机 Safari 支持 webkitAudioContext。
每个 id 40ms 限流，总合成声部上限 48，结束后断开节点。

`SR.bgm.setEnabled(bool)` / `setVolume(0..1)` / `getVolume()` / `isEnabled()`。
默认关闭，音量 0.3；开启后在首次手势解锁时开始原创五声音阶循环。
用三角波衰减模拟拨弦、正弦缓起模拟笛音。关闭时停止调度并淡出；后台暂停上下文和调度。
设置由集成方决定是否保存，本路不扩展存档结构。
