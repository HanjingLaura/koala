"""Rebuild local WOFF2 subsets after website copy changes. Requires fonttools[woff]."""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
root=Path(__file__).resolve().parents[1]/'website'
text=''.join(p.read_text() for p in root.iterdir() if p.suffix in {'.js','.html','.css'})
chars=set(map(ord,text))|set(range(32,127))
for source,dest in [('zcool-xiaowei.ttf','kora-display-subset.woff2'),('manrope.ttf','manrope-subset.woff2')]:
 font=TTFont(root/'assets'/source);options=subset.Options();options.flavor='woff2';options.notdef_glyph=True
 job=subset.Subsetter(options=options);job.populate(unicodes=chars);job.subset(font)
 font.flavor='woff2';font.save(root/'assets'/dest)
 print(dest,(root/'assets'/dest).stat().st_size)
