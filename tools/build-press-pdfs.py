"""Generate print-ready French press releases from their published article text.
Python: beautifulsoup4, reportlab, Pillow. Fonts are supplied under the OFL.
"""
import hashlib, html, json, re, urllib.request
from pathlib import Path
from io import BytesIO
from bs4 import BeautifulSoup
from PIL import Image as PILImage, ImageOps
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Flowable, KeepTogether
from reportlab.lib.utils import ImageReader

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/pdf/communiques';CACHE=ROOT/'tmp/pdfs/media'
OUT.mkdir(parents=True,exist_ok=True);CACHE.mkdir(parents=True,exist_ok=True)
BASE='https://legrimaldibylevillage.com'
BROWN=colors.HexColor('#713506');ACCENT=colors.HexColor('#9d623d');INK=colors.HexColor('#38291f');CREAM=colors.HexColor('#fcf9f3')
PAGE_W,PAGE_H=A4;WIDTH=PAGE_W-92
for name,file in [('PressText','Lato-Regular.ttf'),('PressBold','Lato-Bold.ttf'),('PressTitle','Playfair.ttf')]:pdfmetrics.registerFont(TTFont(name,str(ROOT/'tools/pdf-fonts'/file)))
pdfmetrics.registerFontFamily('PressText',normal='PressText',bold='PressBold',italic='PressText',boldItalic='PressBold')
STYLES={
 'title':ParagraphStyle('Title',fontName='PressTitle',fontSize=24,leading=29,textColor=BROWN,spaceAfter=10),
 'subtitle':ParagraphStyle('Subtitle',fontName='PressText',fontSize=12,leading=17,textColor=ACCENT,spaceAfter=10),
 'meta':ParagraphStyle('Meta',fontName='PressBold',fontSize=9,leading=13,textColor=ACCENT,spaceAfter=13),
 'compactBody':ParagraphStyle('CompactBody',fontName='PressText',fontSize=10.1,leading=14.1,textColor=INK,spaceAfter=8),
 'body':ParagraphStyle('Body',fontName='PressText',fontSize=10.8,leading=15.7,textColor=INK,spaceAfter=10),
 'heading':ParagraphStyle('Heading',fontName='PressTitle',fontSize=14,leading=19,textColor=BROWN,spaceBefore=11,spaceAfter=6,keepWithNext=True),
 'scheduleBody':ParagraphStyle('ScheduleBody',fontName='PressText',fontSize=9.6,leading=13.6,textColor=INK,spaceAfter=6),
 'programme':ParagraphStyle('Programme',fontName='PressBold',fontSize=10.5,leading=15,textColor=BROWN,spaceBefore=6,spaceAfter=3,keepWithNext=True),
 'caption':ParagraphStyle('Caption',fontName='PressText',fontSize=7.7,leading=10,textColor=ACCENT,spaceBefore=5,spaceAfter=13),
 'contact':ParagraphStyle('Contact',fontName='PressText',fontSize=9.1,leading=14,textColor=INK),
}

def resolve(src):
 if src.startswith('/') and (ROOT/src.lstrip('/')).is_file():return ROOT/src.lstrip('/')
 target=CACHE/(hashlib.sha256(src.encode()).hexdigest()+'.jpg')
 if target.exists():return target
 # Reuse the project image audit when available; it preserves the same photograph.
 audit=ROOT.parent/'quality-audit/results.json'
 if audit.exists():
  for item in json.loads(audit.read_text()):
   if item.get('url')==src and (ROOT.parent/item['file']).exists():return ROOT.parent/item['file']
 request=urllib.request.Request(src,headers={'User-Agent':'Mozilla/5.0'})
 with urllib.request.urlopen(request,timeout=40) as response:target.write_bytes(response.read())
 return target

def image_data(path,max_size=(1600,1600)):
 im=PILImage.open(path)
 if im.mode in ('RGBA','LA'):
  bg=PILImage.new('RGB',im.size,'#fcf9f3');bg.paste(im,mask=im.getchannel('A'));im=bg
 else:im=im.convert('RGB')
 im.thumbnail(tuple(map(int,max_size)),PILImage.Resampling.LANCZOS)
 data=BytesIO();im.save(data,format='JPEG',quality=87,optimize=True);data.seek(0)
 return im,data

class Photo(Flowable):
 def __init__(self,path,width,height,crop=False):
  Flowable.__init__(self);self.width=width;self.height=height;im,data=image_data(path,(width*2.7,height*2.7))
  if crop:
   im=ImageOps.fit(im,(int(width*2.5),int(height*2.5)),method=PILImage.Resampling.LANCZOS)
   data=BytesIO();im.save(data,'JPEG',quality=87,optimize=True);data.seek(0)
  self.image=ImageReader(data);self.ratio=im.width/im.height
 def draw(self):
  c=self.canv;c.setFillColor(CREAM);c.rect(0,0,self.width,self.height,fill=1,stroke=0)
  w=min(self.width,self.height*self.ratio);h=w/self.ratio
  c.drawImage(self.image,(self.width-w)/2,(self.height-h)/2,width=w,height=h)

class Gallery(Flowable):
 def __init__(self,items):
  Flowable.__init__(self);self.width=WIDTH;self.height=140;self.photos=[Photo(path,(WIDTH-12)/2,114,False) for path,_ in items];self.items=items
 def draw(self):
  for i,(photo,(_,caption)) in enumerate(zip(self.photos,self.items)):
   x=i*(WIDTH+12)/2;photo.drawOn(self.canv,x,26)
   p=Paragraph(html.escape(caption),STYLES['caption']);p.wrap((WIDTH-12)/2,24);p.drawOn(self.canv,x,5)

class Contact(Flowable):
 def __init__(self,slug):Flowable.__init__(self);self.width=WIDTH;self.height=83;self.slug=slug
 def draw(self):
  c=self.canv;c.setFillColor(CREAM);c.rect(0,0,WIDTH,83,fill=1,stroke=0);c.setStrokeColor(ACCENT);c.setLineWidth(.6);c.line(0,83,WIDTH,83)
  text='<b>Le Grimaldi by Le Village</b> · Restaurant &amp; hôtel<br/>4 Place du Château · 06800 Cagnes-sur-Mer<br/><link href="mailto:contact@legrimaldibylevillage.fr">contact@legrimaldibylevillage.fr</link> · <link href="'+BASE+'">legrimaldibylevillage.com</link><br/><link color="#713506" href="'+BASE+'/dossier-presse">Consulter le dossier de presse</link> · <link color="#713506" href="'+BASE+'/'+self.slug+'">Lire le communiqué en ligne</link>'
  p=Paragraph(text,STYLES['contact']);p.wrap(WIDTH-24,70);p.drawOn(c,12,12)

def inline(tag):
 s=BeautifulSoup(str(tag),'html.parser');root=s.find()
 for n in root.find_all(True):
  if n.name=='strong':n.name='b'
  elif n.name=='em':n.name='i'
  elif n.name not in ('b','i','br'):n.unwrap();continue
  n.attrs={}
 return re.sub(r'\s+',' ',root.decode_contents()).replace('—','-').replace('–','-').strip()

def footer(c,doc):
 c.saveState();c.drawImage(str(ROOT/'tools/pdf-assets/brand-logo.png'),46,PAGE_H-73,width=54,height=54,mask='auto');c.setFillColor(BROWN);c.setFont('PressBold',9);c.drawString(111,PAGE_H-47,'LE GRIMALDI BY LE VILLAGE')
 c.setFont('PressText',8);c.setFillColor(ACCENT);c.drawString(111,PAGE_H-62,'Restaurant & hôtel · Haut-de-Cagnes')
 c.setFont('PressText',8);c.drawRightString(PAGE_W-46,PAGE_H-48,'COMMUNIQUÉ DE PRESSE')
 c.setStrokeColor(colors.HexColor('#dbc6b4'));c.setLineWidth(.6);c.line(46,PAGE_H-75,PAGE_W-46,PAGE_H-75)
 c.line(46,49,PAGE_W-46,49);c.setFont('PressText',7.5);c.drawString(46,34,'legrimaldibylevillage.com');c.drawRightString(PAGE_W-46,34,str(doc.page));c.restoreState()

def build():
 records=[]
 for page in json.loads((ROOT/'tools/manifest.json').read_text()):
  if page['kind']!='press-release':continue
  slug=page['path'].lstrip('/');s=BeautifulSoup((ROOT/page['file']).read_text(),'html.parser');main=s.select_one('main');article=main.article
  prose=next(d for d in article.find_all('div') if 'lg:w-3/5' in d.get('class',[]))
  short=slug not in ('automne-haut-de-cagnes','ete-en-musique-jazz-cagnes-sur-mer')
  is_programme=bool(prose.select('.prog-content'))
  metadata=prose.find('p');title=main.h1.get_text(' ',strip=True);subtitle=main.h1.parent.find('p',recursive=False)
  if 'drop-cap' in metadata.get('class',[]) and subtitle is not None:metadata,subtitle=subtitle,None
  story=[Paragraph(html.escape(title),STYLES['title'])]
  if subtitle:story.append(Paragraph(inline(subtitle),STYLES['subtitle']))
  story.append(Paragraph(inline(metadata),STYLES['meta']))
  feature=main.find('img');story.extend([Photo(resolve(feature['src']),WIDTH,90 if slug=='week-end-1er-mai-hotel-restaurant-cagnes-sur-mer' else 114 if short or is_programme else 174),Paragraph(html.escape(feature.get('alt','')),STYLES['caption'])])
  for tag in prose.find_all(['p','h2','h3','h4','summary','div']):
   if tag is metadata:continue
   if tag.name=='div':
    if 'prog-content' not in tag.get('class',[]):continue
    style='scheduleBody'
   elif tag.name=='summary':style='programme'
   elif tag.name.startswith('h'):style='heading'
   else:style='compactBody' if slug=='week-end-1er-mai-hotel-restaurant-cagnes-sur-mer' else 'body'
   text=inline(tag)
   if text:story.append(Paragraph(text,STYLES[style]))
  # Add a small photographic selection, not the web gallery or menu viewer.
  seen={feature['src']};items=[]
  for image in main.select('img[src]'):
   src=image['src'];alt=image.get('alt','')
   if not src or src in seen or any(word in alt.lower() for word in ('affiche','menu','carte','croquis')):continue
   seen.add(src);items.append((resolve(src),alt))
   if len(items)==2:break
  if items and not short and not is_programme:story.extend([Spacer(1,9),Gallery(items)])
  story.extend([Spacer(1,15),Contact(slug)])
  file=OUT/(slug+'.pdf')
  doc=SimpleDocTemplate(str(file),pagesize=A4,leftMargin=46,rightMargin=46,topMargin=94,bottomMargin=66,title=title,author='Le Grimaldi by Le Village',subject='Communiqué de presse - Haut-de-Cagnes, Cagnes-sur-Mer',pageCompression=1)
  doc.build(story,onFirstPage=footer,onLaterPages=footer)
  records.append({'slug':slug,'file':'/assets/pdf/communiques/'+file.name,'title':title})
  print(file.name,file.stat().st_size)
 (ROOT/'tools/press-pdfs.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')

if __name__=='__main__':build()
