# M 场景与特效交付报告

## 风格与来源

已读 AGENTS.md、docs/interfaces.md §6、docs/report-d-art.md、tools/art/prompts.json，并查看现有竹海背景和用户提供的三张概念图。当前目录和 /workspace/soul-realm-idle-wt/k-ui/docs/ 均没有 style-bible.md，故按 prompts.json 延续清新中国水墨、宣纸淡彩、青玉/炭墨/古金/朱砂配色。

所有视觉像素由内置 image_gen 生成，没有下载、CSS/SVG/Canvas 或程序绘图替代。提示词、目标尺寸和帧参数逐项保存在 tools/m/specs.json。原图从 ~/.codex/generated_images/ 复制到 tools/m/raw/；tools/m/.gitignore 忽略 raw，原图和审阅拼图不提交。

## 数量清单

计划并交付46张WebP，其中22张为四帧横向图集，共88个动画帧。

| 类别 | 数量 | 键名 |
|---|---:|---|
| 三地视差层 | 9 | bg_{forest,snow,ember}_{far,mid,front} |
| 首领战背景 | 2 | bg_boss_{jade,cinder} |
| 无字开场插画 | 3 | bg_opening_{awakening,bond,fusion} |
| 加载页 | 1 | bg_loading |
| 五色魂环点亮扩散 | 5图集 | fx_ring_{white,yellow,purple,black,red} |
| 四脉斩击与爆裂 | 8图集 | fx_{wind,flame,rock,moon}_{slash,burst} |
| 融合技 | 1图集 | fx_fusion |
| 暴击/伤害无字底纹 | 2 | fx_crit_plate、fx_damage_plate |
| 五色掉落光柱 | 5图集 | fx_drop_{white,yellow,purple,black,red} |
| 魂环上浮 | 1图集 | fx_ring_rise |
| 受击/屏震红边 | 1 | fx_hit_edge |
| 墨点粒子 | 6 | fx_ink_particle_1…6 |
| 吸收成功/失败 | 2图集 | fx_absorb_{success,fail} |

场景为780×1688，far层与独立背景不透明，mid/front层透明。红边为390×844透明遮罩。普通动画为4×256×256，融合为4×384×384；播放12fps、loop:false。底纹和粒子为单帧；具体尺寸以清单为准。

## 后处理与接入

运行 `python3 tools/m/process.py`，仅进行裁切、等比尺寸规整、透明留边、横向等宽装帧及WebP压缩。透明原图保持生成的alpha，不用白色阈值抠掉浅色光效。图集按生成的四个等宽区域切分，统一帧画布，不逐帧独立紧裁，保留动画中心。

输出 assets/scene/manifest.json、manifest.js 与 assets/fx/manifest.json、manifest.js；JS通过Object.assign合并SR.ASSETS，动画附frames/fw/fh/fps和loop:false。应在原assets/manifest.js之后加载。完整接入请求见 docs/requests-m.md。

未改入口或舞台，因此资源加载与实战播放由集成方接入；本次没有手机实机播放验证。屏震的位移由舞台控制，贴图提供受击边缘，粒子运动同理由舞台控制。

## 失败与替换

共生成49张原图，交付46张；3张粒子初稿出现莲花装饰，与抽象墨点要求不符，已使用image_gen重生替换，弃用稿保存在raw/rejected/。没有工具调用失败，也没有采用非生成图片替换。原图长宽比偶有偏离目标：背景中心裁切，透明层等比缩放后补透明边；图集分帧后等比规整，不拉伸笔触。审阅拼图只合成生成素材以供目检，不作为游戏素材。

## 校验

校验脚本：tests/assets_m.test.js检查键名、精确清单数量、文件存在、真实WebP尺寸、十进制300KB/1MB预算、图集参数以及重复加载的合并行为；tools/m/validate.py完整解码所有图片，检查透明通道、非空动画帧、前景/红边中心留白和体积。

全部JS语法检查和15个tests/*.test.js均通过；python3 tools/m/validate.py通过46张完整解码、透明通道、帧非空、中央留白与体积校验。场景15张共3,648,618字节，最大298,148字节；特效31张共2,281,528字节，最大223,066字节（融合图集）。合计5,930,146字节，所有单图均低于十进制300KB，所有图集低于1MB。未push，未切换或修改master，未修改其他路文件或公共清单。
