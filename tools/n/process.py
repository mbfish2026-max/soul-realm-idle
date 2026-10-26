"""Only alpha trimming, resizing, packing and WebP compression; never draw art."""
import json
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
RAW=ROOT/'tools/n/raw'
OUT=ROOT/'assets/skills'

def normalize(source,size=128):
    im=Image.open(source).convert('RGBA')
    # Preserve interior ivory, pale paint and existing antialiased alpha.
    if im.getchannel('A').getextrema()[0]==255:
        raise ValueError(f'Generated source lacks transparency: {source}')
    box=im.getchannel('A').point(lambda a:255 if a>8 else 0).getbbox()
    if not box: raise ValueError(f'Empty image: {source}')
    im=im.crop(box)
    im.thumbnail((int(size*.82),int(size*.82)),Image.Resampling.LANCZOS)
    canvas=Image.new('RGBA',(size,size))
    canvas.alpha_composite(im,((size-im.width)//2,(size-im.height)//2))
    return canvas

def build_icons():
    OUT.mkdir(parents=True,exist_ok=True)
    records={}
    for source in sorted(RAW.glob('*.png')):
        if source.stem.startswith('fx_'):continue
        im=normalize(source)
        file=OUT/(source.stem+'.webp')
        im.save(file,'WEBP',quality=88,method=6,exact=True)
        assert file.stat().st_size<=300000
        records[source.stem]={'file':str(file.relative_to(ROOT)),'w':128,'h':128,'use':'skill icon','scale':2}
    # Static icon atlas: rect metadata, never animation frame metadata.
    keys=sorted(records)
    for start in range(0,len(keys),64):
        group=keys[start:start+64]
        atlas=Image.new('RGBA',(1024,((len(group)+7)//8)*128))
        for i,key in enumerate(group):
            x,y=(i%8)*128,(i//8)*128
            atlas.alpha_composite(Image.open(ROOT/records[key]['file']).convert('RGBA'),(x,y))
            records[key]['atlas']={'file':f'assets/skills/icons_{start//64:02d}.webp','x':x,'y':y,'w':128,'h':128}
        target=OUT/f'icons_{start//64:02d}.webp'
        atlas.save(target,'WEBP',quality=88,method=6,exact=True)
        assert target.stat().st_size<=1000000
    (RAW/'processed.json').write_text(json.dumps(records,indent=2)+'\n')
    print(f'Processed {len(records)} icons')

if __name__=='__main__':build_icons()

def build_fx():
    records={}
    for source in sorted(RAW.glob('fx_*.png')):
        im=Image.open(source).convert('RGBA')
        if im.getchannel('A').getextrema()[0]==255:
            raise ValueError(f'FX source lacks transparency: {source}')
        # Fixed cell crops and uniform resizing preserve generator frame anchors.
        cw,ch=im.width//2,im.height//2
        frames=[]
        for y in range(2):
            for x in range(2):
                cell=im.crop((x*cw,y*ch,(x+1)*cw,(y+1)*ch))
                cell.thumbnail((256,256),Image.Resampling.LANCZOS)
                frame=Image.new('RGBA',(256,256))
                frame.alpha_composite(cell,((256-cell.width)//2,(256-cell.height)//2))
                frames.append(frame)
        assert len({f.tobytes() for f in frames})==4, f'Repeated static frames: {source}'
        atlas=Image.new('RGBA',(1024,256))
        for i,frame in enumerate(frames):atlas.alpha_composite(frame,(i*256,0))
        target=OUT/(source.stem+'.webp')
        atlas.save(target,'WEBP',quality=88,method=6,exact=True)
        assert target.stat().st_size<=1000000
        records[source.stem]={'file':str(target.relative_to(ROOT)),'w':1024,'h':256,'use':'one-shot skill effect','frames':4,'fw':256,'fh':256,'fps':5,'loop':False,'duration':800,'anchor':[.5,.5]}
    (RAW/'fx-processed.json').write_text(json.dumps(records,indent=2)+'\n')
    print(f'Processed {len(records)} FX sequences')

if __name__=='__main__':build_fx()
