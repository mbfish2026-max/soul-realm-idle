import json
from pathlib import Path
items=[]
def add(key,subject,w,h,slice=None):
 d=dict(key='ui2_'+key,subject=subject,w=w,h=h)
 if slice:d['slice']=[slice]*4
 items.append(d)
add('panel','blank horizontal ivory xuan paper scroll panel with tiny gold cloud corners and empty center, 3:2',720,480,48)
add('modal','blank tall ivory xuan paper popup frame, thin antique gold double border, tiny jade cloud corners, empty center, 17:19',680,760,48)
for kind,color in [('primary','sage jade green'),('secondary','ivory paper')]:
 for state,desc in [('normal','fresh and clearly enabled'),('pressed','slightly darker ink wash, inset inner rim'),('disabled','muted grey low saturation, faded rim')]:add('button_'+kind+'_'+state,f'one blank horizontal {color} button, gold ornamental corners, {desc}, aspect 10:3, no symbols',320,96,24)
add('skill_base','empty circular jade skill medallion, thin antique gold rim, blank jade center',128,128)
add('skill_cooldown','one translucent charcoal ink wash circular cooldown veil, uniform softly textured disk, no rim, no symbols, translucent alpha',128,128)
for kind,color in [('hp','muted cinnabar red'),('soul','muted violet'),('progress','sage jade green')]:
 add('bar_'+kind+'_base','one extremely slim horizontal empty ivory paper status bar trough, fine gold rim, aspect 15:1, no marks',480,32,12)
 add('bar_'+kind+'_fill',f'one extremely slim horizontal {color} watercolor status bar fill, softly rounded ends, aspect 15:1, no marks',480,32,12)
for key,sub in [('battle','crossed ink swords'),('pet','elegant jade fox silhouette'),('ring','hollow spiritual ring'),('bag','cloth drawstring bag'),('bone','jade spiritual bone'),('realm','misty mountain gate'),('achievement','laurel medal'),('settings','carved jade cogwheel')]:add('nav_'+key,'one navigation icon depicting '+sub+', charcoal and jade, no enclosing square',96,96)
for state,sub in [('active','sage jade paper with gold rim'),('inactive','ivory paper with faded gold rim')]:add('tab_'+state,'one blank horizontal tab, '+sub+', aspect 3:1',240,80,20)
add('divider','one very slim horizontal antique gold separator line with tiny cloud flourish at center, aspect 20:1',640,32)
add('cloud','one graceful sage jade traditional auspicious cloud flourish, horizontal aspect 8:3',256,96)
add('seal','one empty vermilion hand stamped rectangular double seal border, transparent empty center, no letters',96,128)
add('logo','one original jade emblem combining an open spiritual ring, a small mountain and a cloud, no letters',320,320)
add('title','Chinese brush calligraphy exact text 魂域挂机, four characters horizontally, charcoal ink with restrained jade wash, no other letters or seals',720,240)
for key,txt in [('start','开始游戏'),('absorb','吸收'),('abandon','放弃'),('store','存入'),('hatch','孵化'),('upgrade','升级'),('evolve','蜕变'),('equip','穿戴'),('salvage','分解')]:add('text_'+key,f'Chinese brush calligraphy exact text {txt}, horizontally centered, charcoal ink, no other text, no seal, no border',256,80)
for key,sub in [('crystal','faceted pale jade spirit crystal'),('beast_soul','jade animal soul wisp'),('pact','ivory paper covenant talisman with abstract cinnabar strokes, no readable text'),('essence','violet spiritual essence pearl'),('egg','ivory beast egg with jade cloud markings'),('herb','three medicinal sage leaves'),('ore','cluster of dark spiritual ore'),('bone','ivory spiritual bone fragment with jade tip'),('scroll','rolled ivory scroll tied with jade silk'),('stone','round jade upgrade stone'),('dust','small pile of antique gold spiritual dust'),('chest','small carved jade treasure chest')]:add('item_'+key,'one inventory icon depicting '+sub,96,96)
for key,color in [('white','ivory white'),('yellow','gold yellow'),('purple','violet'),('black','charcoal black'),('red','cinnabar red'),('gold','antique gold with fine engraved cloud filigree')]:add('ring_'+key,f'one frontal hollow {color} spiritual soul ring, delicate ink wash luminous rim, genuinely transparent empty center, no solid disc',128,128)
for i,sub in enumerate(['sprouting bamboo','crossed swords','spiritual ring','fox paw','mountain summit','open book','lotus','treasure chest','jade crown','sun above cloud'],1):add('achievement_%02d'%i,'one jade achievement medal with thin antique gold rim depicting '+sub,96,96)
for key,sub in [('forest','bamboo grove on mossy stone'),('river','small winding river and arched stone bridge'),('snow','snowy peak and sparse pine'),('ember','cinnabar rocky peak and tiny ember fissure'),('ruin','ancient jade gate ruins with moss'),('summit','mountain summit pavilion among clouds')]:add('node_'+key,'one miniature map location vignette depicting '+sub+', isolated miniature landscape, transparent exterior, no square background',192,192)
for a in items:
 if a['key']=='ui2_panel':a['slice']=[96,96,96,96]
 elif a['key']=='ui2_modal':a['slice']=[96,160,96,160]
 elif 'button_' in a['key']:a['slice']=[32,72,32,72]
 elif 'tab_' in a['key']:a.pop('slice',None)
Path('tools/k/catalog.json').write_text(json.dumps(items,ensure_ascii=False,indent=2)+'\n')
print(len(items))
