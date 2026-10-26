"""Production subjects; each record is generated separately using built-in image_gen."""
SUBJECTS = []
def add(key, subject, kind):
    SUBJECTS.append(dict(key=key, subject=subject, kind=kind))
for key, subject in [
 ('snowmink','snow-white mink, icy teal eyes, frosted fur'),
 ('iceserpent','coiled ice-scaled python, translucent blue scales'),
 ('frostdeer','frost-antler deer, pale blue crystalline branching antlers'),
 ('coldcrow','cold raven with ink-black feathers and frosted silver wing edges'),
 ('magmalizard','lava-armored lizard, charcoal overlapping scales and vermilion fissures'),
 ('redfalcon','red-feathered falcon, vermilion wings and ochre talons'),
 ('lavawolf','rock-flame wolf, basalt mane and restrained ember accents'),
 ('ashspider','ash spider, eight slender legs, charcoal abdomen and muted red markings')]:
    add('mob_'+key,subject,'mob')
add('boss_snowlord','majestic massive snow leopard abyss sovereign, ice crystalline antlers, flowing snowy mane, powerful crouching silhouette, cold blue and ink gray','boss')
add('boss_ridgelord','majestic massive volcanic horned lion abyss sovereign, basalt armored mane, vermilion ember cracks, powerful crouching silhouette','boss')
PETS = [
 ('bud','small living jade seed spirit, two fresh leaves, tiny root feet, expressive luminous eyes'),
 ('thorn','thorny vine seed spirit, curled root legs, protective green leaf armor'),
 ('crownseed','regal botanical seed spirit, lotus leaf crown, jade foliage and golden seed core'),
 ('emberseed','warm ember seed spirit, curled vermilion leaves, glowing orange seed core'),
 ('prismfox','elegant moon-white fox, three flowing tails, subtle iridescent jade and lavender tips'),
 ('aurorafox','elegant arctic fox, five flowing tails, icy blue fur tips and pale aurora ribbons'),
 ('skyfox','elegant celestial wind fox, seven flowing cloudlike tails, pale sage accents'),
 ('everfox','elegant ancient moon fox, nine long silver tails, dark indigo forehead jewel'),
 ('dawnfox','regal divine dawn fox, nine sweeping ivory tails, pale gold forehead ornament and peach dawn accents'),
 ('magmahorn','majestic molten antler stag, charcoal coat, vermilion branching antlers and ember hooves')]
for key, subject in PETS:
    add('pet_'+key+'_idle',subject,'pet')
    add('icon_pet_'+key,subject,'portrait')
SLOTS = dict(crown='ancient Chinese hair crown',robe='flowing Chinese cultivation robe, no wearer',belt='ornate waist belt',boots='pair of traditional cloth boots',bracer='pair of forearm bracers',skirt='pleated lower robe skirt, no wearer',necklace='pendant necklace',ring='finger ring',weapon='ritual sword artifact',jade='carved jade waist pendant')
for key, subject in SLOTS.items():
    add('gear_'+key,'plain jade and sage '+subject,'icon')
for theme, detail in [('frost','high tier silver, pale blue crystal and snowflake ornament'),('ember','high tier antique gold, vermilion and phoenix feather ornament')]:
    for key, subject in SLOTS.items():
        if key not in ('weapon','jade'):
            add('gear_'+theme+'_'+key,detail+' '+subject,'icon')
add('icon_bone_external','external spirit bone, single symmetrical wing-shaped ivory and jade skeletal artifact','icon')
for key, subject in [
 ('achievement','golden laurel surrounding a luminous jade pearl'),
 ('achievement_battle','crossed ritual swords with a red victory tassel'),
 ('achievement_pet','jade paw medallion with a small silver leaf'),
 ('achievement_ring','five nested luminous spirit rings in white gold purple charcoal and red'),
 ('daily','rolled bamboo task scroll with a jade clasp, entirely blank'),
 ('daily_hunt','archery target and one arrow with red feather'),
 ('daily_gift','small ornate jade gift chest with a red silk knot'),
 ('rift','mysterious stone arch portal with pale violet mist'),
 ('rift_tower','slender ancient pagoda rising from a small cloud'),
 ('rift_token','antique jade key with a red silk tassel')]:
    add('ui_'+key,subject,'icon')
add('bg_snow','Cold river snowy ridges, Chinese layered alpine mountains, snow-laden pines framing both sides, pale icy jade river in central valley, luminous white mist, ample low contrast open center for game combat','background')
add('bg_ridge','Vermilion volcanic cliffs, Chinese layered craggy mountains, muted red ochre strata and charcoal rock, distant thin glowing lava stream, sage mist, ample low contrast open center for game combat','background')

def prompt(item):
    if item['key'] == 'mob_snowmink':
        return 'Use case: stylized-concept. Single game sprite of a snow-white mink abyss beast, full body, crouching alert, facing left, icy teal eyes and fine frosted fur. Chinese ink wash and pale watercolor on xuan paper aesthetic, elegant brush edges, muted sage and cold blue accents, same aesthetic as the provided Chinese ink fantasy game references. Isolated single subject centered, generous transparent margins, no ground, no scenery, no text, no letters, no seal, no frame. Actual transparent background.'
    base = 'Use case: stylized-concept. Production asset for a Chinese ink fantasy mobile game. Chinese ink wash and pale mineral watercolor, fine elegant brush edges, xuan paper aesthetic, restrained colors, handcrafted painterly detail. '
    if item['kind'] == 'background':
        return base + 'Portrait landscape, aspect ratio 780:1688. '+item['subject']+'. Continuous full bleed scenery, pale ivory atmosphere. No people, animals, buildings, text, letters, seals, watermark, interface or frame.'
    framing = 'Full body creature, all limbs and tail fully visible, facing left, isolated single subject centered with generous margins. '
    if any(item['key'] == prefix + seed + suffix for seed in ('bud','thorn','crownseed','emberseed') for prefix,suffix in [('pet_','_idle'),('icon_pet_','')]):
        framing = 'A botanical seed spirit, round seed or bulb core with tiny eyes, two short root feet and leaves. Not a quadruped animal. No fox, no deer, no mammal, no snout, no fur, no human face, no human body, no ears, no long animal tail. Whole compact botanical body visible. '
    elif item['kind'] == 'portrait':
        framing = 'Close-up face and upper body portrait of this creature, distinctive face centered, single subject, no border. '
    if item['kind'] == 'icon':
        framing = 'Square inventory icon, single isolated item centered, complete silhouette, large readable shape at 48 pixels, no surrounding decoration. '
    return base+framing+item['subject']+'. Actual transparent background, no ground, no scenery, no cast shadow, no text, no letters, no seals, no watermark, no frame. Muted sage jade, ivory and ink charcoal palette with the specified accent colors.'
