# MAP → WIRE 接线请求

本路不修改 main/index/tabs/core/battle/core/offline/core/save（超出所有权）。实现与接口已就绪，接线前正式入口仍使用原地图。

1. content.install 后、idle.start 前调用 SR.buildWorldMap()；加载 core/progress.js，调用 progress.install()。加载 ui/worldmap.js/css，在手札或地图入口提供容器并 mount；切页 unmount。
2. battle.spawn 以 progress.encounter() 取得 table/wave/boss，waveMax=node.waves。保留真实 mapId/floor 给 loot、舞台与素材选择；波次用 world.wave。普通节点不得依旧在第十波生首领。
3. battle.step 的 !target 分支完全替换旧 floor/map 推进为 progress.clearWave(state,SR.auto.config())；hero_down 重置 world.wave=1。结算后同步兼容 state.map={mapId:enc.node.mapId,floor:enc.node.floor,wave:world.wave,bestFloor:…}，emit world:changed 与原 wave_clear。不要同时执行两套推进。
4. world:select_request：若 offline.claiming/idle.settling 则拒绝；否则 stop 战斗，progress.select；成功后同步兼容 map、标脏并保存、重启战斗、emit world:changed。失败不要重启或改档。在线/离线都必须使用上述同一推进逻辑。
5. save.migrate 必须保留 world（目前 Object.assign 保留未知字段）；load 后迁移一次，在离线结算前完成。兼容 offline.calculate 分支取 progress.encounter 的掉落来源，取消既有 9999 年封顶并传真实 sourceKind；优先继续真实 battle 模拟。
6. 秘境保持 state.rift 独立，绝不调用主线 clearWave；auto.advance / challengeBoss 原设置直接传入，不另造开关。

平衡边界：地图沿用十五层全部属性/年限/物种，但总波数、首领密度改变；原 68/73h 不能直接视为新地图验证。接线后需用真实在线与离线模拟复验并调参，MAP 本次未声明完整60–80h达标。
