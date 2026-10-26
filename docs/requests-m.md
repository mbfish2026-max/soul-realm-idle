# M 场景与特效接入请求

请集成方在原 assets/manifest.js **之后**加载 assets/scene/manifest.js 与 assets/fx/manifest.js；两者用 Object.assign 合并 SR.ASSETS，不修改原清单。

场景三层：bg_{forest|snow|ember}_{far|mid|front}，均为780×1688；far不透明，mid/front透明，同一画幅底部对齐，视差只平移图片。首领战背景：bg_boss_jade、bg_boss_cinder。无字开场：bg_opening_awakening、bg_opening_bond、bg_opening_fusion；加载页：bg_loading。

特效以 fx_ 开头，详见 assets/fx/manifest.json。动画横向排列，帧源矩形为 [frame*fw,0,fw,fh]；按 fps 播放一次，结束移除。勿把整条图集缩成单帧。loop:false；1帧贴图亦包含帧参数。粒子只移动/缩放已生成的贴图，禁止程序绘制替代素材。

魂环以脚底中心为锚点；光柱以底部中心为锚点；斩击/爆裂/融合以中心为锚点。fx_hit_edge覆盖舞台，用位置偏移实现屏震并短暂显示该贴图，勿程序绘制红边。暴击/伤害底纹无字，数字应由界面文本叠加。

本路仅交付素材和清单，不修改入口、舞台、公共清单或其他路代码。
