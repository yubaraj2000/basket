"""Generate a self-contained HTML mock of the Basket practice app (4 screens + captions + tokens)."""
import random, sys

C = dict(primary="#1A7A50", primary_soft="#E4F2EA", primary_ink="#0F4D32",
         accent="#E07A1F", accent_soft="#FCEBDA", accent_ink="#8A4510",
         bg="#F7F6F2", surface="#FFFFFF", text="#1C1B1A", muted="#6B6862",
         border="#E6E3DC", danger="#C2410C")

PATHS = {
 "basket": '<path d="m15 11-1 9"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/><path d="M4.5 15.5h15"/><path d="m5 11 4-7"/><path d="m9 11 1 9"/>',
 "plus": '<path d="M12 5v14"/><path d="M5 12h14"/>',
 "check": '<path d="M20 6 9 17l-5-5"/>',
 "mic": '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/>',
 "bell": '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
 "share": '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="m15.41 6.51-6.82 3.98"/>',
 "link": '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
 "chevron": '<path d="m6 9 6 6 6-6"/>',
 "back": '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
 "play": '<path d="M7 4v16l13-8Z"/>',
 "x": '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
 "copy": '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
 "minus": '<path d="M5 12h14"/>',
}

def icon(name, size=20, color=C["text"], width=2, fill="none"):
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="{fill}" stroke="{color}" '
            f'stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round" '
            f'xmlns="http://www.w3.org/2000/svg">{PATHS[name]}</svg>')

def status(dark=False):
    col = "#FFFFFF" if dark else C["text"]
    return f'''<div class="status" style="color:{col}"><span>9:41</span>
      <span class="st-icons"><svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" fill="{col}"/><rect x="5" y="5" width="3" height="7" rx="1" fill="{col}"/><rect x="10" y="2" width="3" height="10" rx="1" fill="{col}"/><rect x="15" y="0" width="3" height="12" rx="1" fill="{col}"/></svg>
      <svg width="26" height="12" viewBox="0 0 26 12"><rect x="0.5" y="0.5" width="22" height="11" rx="3" fill="none" stroke="{col}"/><rect x="2.5" y="2.5" width="15" height="7" rx="1.5" fill="{col}"/><rect x="24" y="4" width="2" height="4" rx="1" fill="{col}"/></svg></span></div>'''

def gesture(dark=False):
    return f'<div class="gesture"><div class="pill" style="background:{"#FFFFFF" if dark else C["text"]}"></div></div>'

def avatar(initials, bg, fg="#FFFFFF", size=36, ring=False):
    r = f'border:2px solid {C["bg"]};' if ring else ''
    return (f'<div class="avatar" style="width:{size}px;height:{size}px;background:{bg};color:{fg};'
            f'font-size:{int(size*0.4)}px;{r}">{initials}</div>')

AV = {"M": "#B4536A", "R": "#3B6EA8", "A": "#7A5AB5", "N": "#1A7A50"}

def item(name, meta, chip="", done=False):
    box = (f'<div class="check done">{icon("check", 14, "#FFFFFF", 3)}</div>' if done
           else '<div class="check"></div>')
    cls = "item done" if done else "item"
    return f'''<div class="{cls}">{box}<div class="item-main"><div class="item-name">{name}</div>
      <div class="item-meta">{meta}</div></div>{chip}</div>'''

def chip_voice(t):
    return f'<div class="chip chip-voice">{icon("play", 12, C["primary_ink"], 2, C["primary_ink"])}<span>{t}</span></div>'

def chip_remind(t):
    return f'<div class="chip chip-remind">{icon("bell", 13, C["accent_ink"], 2.2)}<span>{t}</span></div>'

def qr_html(n=21, cell=8, seed=7):
    rnd = random.Random(seed)
    cells = []
    def finder(r, c, r0, c0):
        rr, cc = r - r0, c - c0
        if 0 <= rr < 7 and 0 <= cc < 7:
            if rr in (0, 6) or cc in (0, 6): return True
            if 2 <= rr <= 4 and 2 <= cc <= 4: return True
            return False
        return None
    for r in range(n):
        row = []
        for c in range(n):
            v = None
            for (r0, c0) in ((0, 0), (0, n - 7), (n - 7, 0)):
                f = finder(r, c, r0, c0)
                if f is not None: v = f
            if v is None:
                near = (r < 8 and c < 8) or (r < 8 and c >= n - 8) or (r >= n - 8 and c < 8)
                v = False if near else rnd.random() < 0.5
            row.append(f'<div class="qc" style="background:{C["text"] if v else "transparent"}"></div>')
        cells.append('<div class="qr-row">' + "".join(row) + '</div>')
    return f'<div class="qr">{"".join(cells)}</div>'

def caption(num, title, points):
    lis = "".join(f'<div class="cap-row"><div class="cap-tag">{t}</div><div class="cap-text">{d}</div></div>' for t, d in points)
    return f'''<div class="caption"><div class="cap-num">Screen {num}</div><div class="cap-title">{title}</div>
      <div class="cap-sub">What you learn building it</div>{lis}</div>'''

CSS = f"""
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:Inter,Roboto,Arial,sans-serif;background:#E9E7E1;color:{C['text']};padding:60px;display:flex;gap:72px;align-items:flex-start;width:max-content}}
.col{{display:flex;flex-direction:column;gap:28px;width:412px}}
.screen{{width:412px;height:917px;background:{C['bg']};position:relative;overflow:hidden;display:flex;flex-direction:column}}
.status{{height:40px;padding:0 24px;display:flex;align-items:center;justify-content:space-between;font-size:14px;font-weight:600;flex-shrink:0}}
.st-icons{{display:flex;gap:6px;align-items:center}}
.gesture{{position:absolute;left:0;right:0;bottom:0;height:28px;display:flex;align-items:center;justify-content:center}}
.pill{{width:108px;height:4px;border-radius:2px;opacity:.85}}
.btn{{height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:16px;font-weight:600}}
.btn-primary{{background:{C['primary']};color:#FFFFFF}}
.btn-secondary{{background:{C['surface']};color:{C['primary']};border:1.5px solid {C['primary']}}}
.label{{font-size:13px;font-weight:600;color:{C['muted']};margin-bottom:6px}}
.input{{height:52px;border-radius:14px;background:{C['surface']};border:1.5px solid {C['border']};display:flex;align-items:center;gap:10px;padding:0 16px;font-size:16px}}
.input.focus{{border-color:{C['primary']}}}
.placeholder{{color:{C['muted']}}}
.avatar{{border-radius:999px;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0}}
.appbar{{display:flex;align-items:center;justify-content:space-between;padding:8px 20px 12px 20px}}
.h-title{{font-size:24px;font-weight:700;letter-spacing:-0.2px}}
.h-sub{{font-size:13px;color:{C['muted']};margin-top:2px;display:flex;align-items:center;gap:6px}}
.dot{{width:8px;height:8px;border-radius:999px;background:{C['primary']}}}
.icon-btn{{width:40px;height:40px;border-radius:999px;background:{C['surface']};border:1px solid {C['border']};display:flex;align-items:center;justify-content:center}}
.stack{{display:flex}}
.stack .avatar{{margin-left:-8px}}
.live{{margin:0 20px;background:{C['primary_soft']};border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:10px}}
.live-text{{font-size:14px;font-weight:600;color:{C['primary_ink']};flex:1}}
.live-pill{{font-size:11px;font-weight:700;color:#FFFFFF;background:{C['primary']};border-radius:999px;padding:3px 8px;letter-spacing:.4px}}
.progress{{margin:16px 20px 4px 20px}}
.progress-top{{display:flex;justify-content:space-between;font-size:13px;color:{C['muted']};margin-bottom:8px}}
.progress-top b{{color:{C['text']}}}
.bar{{height:8px;border-radius:999px;background:{C['border']};overflow:hidden}}
.bar-fill{{height:8px;width:55%;background:{C['primary']};border-radius:999px}}
.section{{display:flex;align-items:center;justify-content:space-between;margin:18px 20px 8px 20px;font-size:13px;font-weight:700;color:{C['muted']};letter-spacing:.3px;text-transform:uppercase}}
.card{{margin:0 20px;background:{C['surface']};border:1px solid {C['border']};border-radius:16px;overflow:hidden}}
.item{{display:flex;align-items:center;gap:14px;padding:12px 14px;border-bottom:1px solid {C['border']};min-height:64px}}
.item:last-child{{border-bottom:none}}
.check{{width:24px;height:24px;border-radius:7px;border:2px solid #BDB8AE;flex-shrink:0;display:flex;align-items:center;justify-content:center}}
.check.done{{background:{C['primary']};border-color:{C['primary']}}}
.item-main{{flex:1;min-width:0}}
.item-name{{font-size:16px;font-weight:600}}
.item-meta{{font-size:13px;color:{C['muted']};margin-top:2px}}
.item.done .item-name{{text-decoration:line-through;color:{C['muted']};font-weight:500}}
.chip{{display:flex;align-items:center;gap:5px;border-radius:999px;padding:5px 10px;font-size:12px;font-weight:600;flex-shrink:0}}
.chip-voice{{background:{C['primary_soft']};color:{C['primary_ink']}}}
.chip-remind{{background:{C['accent_soft']};color:{C['accent_ink']}}}
.fab{{position:absolute;right:20px;bottom:44px;height:56px;border-radius:18px;background:{C['primary']};color:#FFFFFF;display:flex;align-items:center;gap:8px;padding:0 20px 0 16px;font-size:16px;font-weight:600;box-shadow:0 6px 16px rgba(26,122,80,.35)}}
.hero{{display:flex;flex-direction:column;align-items:center;text-align:center;padding:56px 32px 28px 32px}}
.hero-circle{{width:128px;height:128px;border-radius:999px;background:{C['primary_soft']};display:flex;align-items:center;justify-content:center;margin-bottom:24px}}
.hero h1{{font-size:34px;font-weight:800;letter-spacing:-0.5px}}
.hero p{{font-size:16px;line-height:24px;color:{C['muted']};margin-top:10px;width:320px}}
.form{{padding:0 24px;display:flex;flex-direction:column;gap:14px}}
.divider{{display:flex;align-items:center;gap:12px;font-size:13px;color:{C['muted']};margin:6px 0}}
.divider .ln{{flex:1;height:1px;background:{C['border']}}}
.foot{{font-size:13px;color:{C['muted']};text-align:center;padding:20px 32px 0 32px;line-height:19px}}
.dim{{position:absolute;left:0;top:0;right:0;bottom:0;background:rgba(28,27,26,.48)}}
.ghost-row{{height:56px;margin:0 20px 10px 20px;border-radius:14px;background:{C['surface']};opacity:.9}}
.sheet{{position:absolute;left:0;right:0;bottom:0;background:{C['surface']};border-radius:28px 28px 0 0;padding:10px 20px 44px 20px;display:flex;flex-direction:column;gap:16px}}
.handle{{width:40px;height:4px;border-radius:2px;background:#CFCAC0;align-self:center}}
.sheet-head{{display:flex;align-items:center;justify-content:space-between}}
.sheet-title{{font-size:20px;font-weight:700}}
.row{{display:flex;align-items:center;justify-content:space-between}}
.stepper{{display:flex;align-items:center;gap:0;border:1.5px solid {C['border']};border-radius:14px;height:48px;overflow:hidden}}
.step-btn{{width:48px;height:48px;display:flex;align-items:center;justify-content:center}}
.step-val{{width:48px;text-align:center;font-size:18px;font-weight:700}}
.unit{{height:48px;border-radius:14px;border:1.5px solid {C['border']};display:flex;align-items:center;gap:6px;padding:0 12px 0 16px;font-size:16px;font-weight:600}}
.panel{{border:1px solid {C['border']};border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:12px}}
.panel-head{{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700}}
.panel-head .muted{{margin-left:auto;font-weight:600;color:{C['primary']};font-size:13px}}
.wave{{display:flex;align-items:center;gap:10px}}
.play{{width:40px;height:40px;border-radius:999px;background:{C['primary']};display:flex;align-items:center;justify-content:center;flex-shrink:0}}
.bars{{display:flex;align-items:center;gap:3px;flex:1;height:32px}}
.b{{width:4px;border-radius:2px;background:{C['primary']}}}
.b.off{{background:#CFCAC0}}
.time{{font-size:13px;font-weight:600;color:{C['muted']}}}
.toggle{{width:48px;height:28px;border-radius:999px;background:{C['primary']};position:relative;flex-shrink:0}}
.knob{{position:absolute;right:3px;top:3px;width:22px;height:22px;border-radius:999px;background:#FFFFFF}}
.invite{{margin:4px 20px 0 20px;background:{C['surface']};border:1px solid {C['border']};border-radius:20px;padding:20px;display:flex;flex-direction:column;align-items:center;gap:16px}}
.invite-title{{font-size:18px;font-weight:700}}
.qr-wrap{{padding:14px;border-radius:16px;border:1px solid {C['border']};background:#FFFFFF}}
.qr{{display:flex;flex-direction:column}}
.qr-row{{display:flex}}
.qc{{width:8px;height:8px}}
.linkbox{{width:100%;height:48px;border-radius:12px;background:{C['bg']};display:flex;align-items:center;gap:10px;padding:0 6px 0 14px;font-size:15px;font-weight:600}}
.linkbox span{{flex:1}}
.copy{{width:36px;height:36px;border-radius:10px;background:{C['surface']};border:1px solid {C['border']};display:flex;align-items:center;justify-content:center}}
.helper{{font-size:13px;color:{C['muted']};text-align:center}}
.member{{display:flex;align-items:center;gap:12px;padding:12px 14px;border-bottom:1px solid {C['border']}}}
.member:last-child{{border-bottom:none}}
.m-main{{flex:1}}
.m-name{{font-size:16px;font-weight:600}}
.m-sub{{font-size:13px;color:{C['muted']};margin-top:2px;display:flex;align-items:center;gap:6px}}
.tag{{font-size:11px;font-weight:700;border-radius:999px;padding:3px 8px}}
.leave{{text-align:center;color:{C['danger']};font-size:15px;font-weight:600;margin-top:18px}}
.caption{{width:412px;background:{C['surface']};border-radius:20px;padding:20px;display:flex;flex-direction:column;gap:10px;border:1px solid {C['border']}}}
.cap-num{{font-size:12px;font-weight:700;color:{C['primary']};letter-spacing:.6px;text-transform:uppercase}}
.cap-title{{font-size:20px;font-weight:700}}
.cap-sub{{font-size:13px;color:{C['muted']};margin-bottom:2px}}
.cap-row{{display:flex;gap:10px;align-items:flex-start}}
.cap-tag{{font-size:12px;font-weight:700;color:{C['primary_ink']};background:{C['primary_soft']};border-radius:8px;padding:4px 8px;flex-shrink:0;width:96px;text-align:center}}
.cap-text{{font-size:14px;line-height:20px;flex:1}}
.tokens{{width:520px;background:{C['surface']};border-radius:24px;padding:28px;display:flex;flex-direction:column;gap:22px;border:1px solid {C['border']}}}
.tk-h{{font-size:26px;font-weight:800;letter-spacing:-0.3px}}
.tk-p{{font-size:14px;line-height:21px;color:{C['muted']}}}
.tk-sec{{font-size:12px;font-weight:700;color:{C['muted']};letter-spacing:.6px;text-transform:uppercase}}
.sw-grid{{display:flex;flex-wrap:wrap;gap:12px}}
.sw{{width:140px;display:flex;flex-direction:column;gap:6px}}
.sw-box{{height:56px;border-radius:12px;border:1px solid {C['border']}}}
.sw-name{{font-size:13px;font-weight:600}}
.sw-hex{{font-size:12px;color:{C['muted']}}}
.type-row{{display:flex;align-items:baseline;gap:14px;border-bottom:1px solid {C['border']};padding-bottom:10px}}
.type-meta{{font-size:12px;color:{C['muted']};width:150px;flex-shrink:0}}
.rs{{display:flex;gap:14px;align-items:flex-end}}
.r-box{{width:64px;height:48px;background:{C['primary_soft']};border:1.5px solid {C['primary']}}}
.r-lab{{font-size:12px;color:{C['muted']};margin-top:6px;text-align:center}}
"""

def screen_welcome():
    return f'''<div class="screen" data-name="1 · Welcome">{status()}
  <div class="hero"><div class="hero-circle">{icon("basket", 60, C["primary"], 1.8)}</div>
    <h1>Basket</h1><p>One shopping list for the whole home. Add things, and watch them get ticked off live, on every phone.</p></div>
  <div class="form">
    <div><div class="label">Your name</div><div class="input focus">Ananya</div></div>
    <div class="btn btn-primary">Create a household list</div>
    <div class="divider"><div class="ln"></div><span>or join one</span><div class="ln"></div></div>
    <div class="input">{icon("link", 18, C["muted"])}<span class="placeholder">Paste invite link or code</span></div>
    <div class="btn btn-secondary">Join list</div>
  </div>
  <div class="foot">No sign-up. Your name is saved only on this phone.</div>
  {gesture()}</div>'''

def screen_list():
    stack = "".join(avatar(i, AV[i], size=32, ring=True) for i in ("M", "R", "A"))
    rows_todo = "".join([
        item("Atta", "5 kg · added by Mom", chip_voice("0:06")),
        item("Milk", "2 packets · added by Arjun", chip_remind("6:00 PM")),
        item("Tomatoes", "1 kg · added by you"),
        item("Dishwash liquid", "1 bottle · added by Riya"),
        item("Bread", "1 loaf · added by Mom"),
    ])
    rows_done = "".join([
        item("Eggs", "12 · ticked by Riya, 4 min ago", done=True),
        item("Rice", "2 kg · ticked by Riya, 6 min ago", done=True),
    ])
    return f'''<div class="screen" data-name="2 · List">{status()}
  <div class="appbar"><div><div class="h-title">Our Home</div><div class="h-sub"><div class="dot"></div>4 members · synced just now</div></div>
    <div style="display:flex;align-items:center;gap:12px"><div class="stack" style="padding-left:8px">{stack}</div>
    <div class="icon-btn">{icon("share", 18, C["text"])}</div></div></div>
  <div class="live">{avatar("R", AV["R"], size=28)}<div class="live-text">Riya is at the shop now</div><div class="live-pill">LIVE</div></div>
  <div class="progress"><div class="progress-top"><span><b>6 of 11</b> bought</span><span>5 left</span></div><div class="bar"><div class="bar-fill"></div></div></div>
  <div class="section"><span>To buy · 5</span></div>
  <div class="card">{rows_todo}</div>
  <div class="section"><span>Bought · 6</span>{icon("chevron", 18, C["muted"])}</div>
  <div class="card">{rows_done}</div>
  <div class="fab">{icon("plus", 22, "#FFFFFF", 2.4)}Add item</div>
  {gesture()}</div>'''

def screen_add():
    heights = [10, 18, 26, 14, 30, 22, 12, 28, 20, 16, 24, 30, 18, 10, 22, 26, 14, 20, 28, 12, 18, 24, 16, 10]
    bars = "".join(f'<div class="b{" off" if i > 14 else ""}" style="height:{h}px"></div>' for i, h in enumerate(heights))
    ghosts = "".join('<div class="ghost-row"></div>' for _ in range(6))
    return f'''<div class="screen" data-name="3 · Add item">{status(dark=True)}
  <div style="padding-top:60px">{ghosts}</div>
  <div class="dim"></div>
  <div class="sheet"><div class="handle"></div>
    <div class="sheet-head"><div class="sheet-title">Add item</div><div class="icon-btn">{icon("x", 18, C["text"])}</div></div>
    <div><div class="label">Item</div><div class="input focus">Atta</div></div>
    <div class="row"><div><div class="label">Quantity</div>
        <div class="stepper"><div class="step-btn">{icon("minus", 18, C["text"])}</div><div class="step-val">5</div><div class="step-btn">{icon("plus", 18, C["text"])}</div></div></div>
      <div><div class="label">Unit</div><div class="unit">kg{icon("chevron", 16, C["muted"])}</div></div></div>
    <div class="panel"><div class="panel-head">{icon("mic", 18, C["primary"])}Voice note<span class="muted">Re-record</span></div>
      <div class="wave"><div class="play">{icon("play", 16, "#FFFFFF", 2, "#FFFFFF")}</div><div class="bars">{bars}</div><div class="time">0:06</div></div></div>
    <div class="panel"><div class="row"><div class="panel-head">{icon("bell", 18, C["accent"])}Remind me</div><div class="toggle"><div class="knob"></div></div></div>
      <div style="display:flex;gap:8px">{chip_remind("Today, 6:00 PM")}<div class="chip" style="background:{C["bg"]};color:{C["muted"]}">Tomorrow</div><div class="chip" style="background:{C["bg"]};color:{C["muted"]}">Pick time</div></div></div>
    <div class="btn btn-primary">Add to list</div>
  </div>
  {gesture()}</div>'''

def screen_share():
    members = "".join([
        f'<div class="member">{avatar("M", AV["M"])}<div class="m-main"><div class="m-name">Mom</div><div class="m-sub"><div class="dot"></div>Online</div></div><div class="tag" style="background:{C["bg"]};color:{C["muted"]}">Owner</div></div>',
        f'<div class="member">{avatar("R", AV["R"])}<div class="m-main"><div class="m-name">Riya</div><div class="m-sub"><div class="dot"></div>At the shop now</div></div><div class="tag" style="background:{C["accent_soft"]};color:{C["accent_ink"]}">Shopping</div></div>',
        f'<div class="member">{avatar("A", AV["A"])}<div class="m-main"><div class="m-name">Arjun</div><div class="m-sub">Last seen 2 h ago</div></div></div>',
        f'<div class="member">{avatar("N", AV["N"])}<div class="m-main"><div class="m-name">Ananya (you)</div><div class="m-sub">This phone</div></div></div>',
    ])
    return f'''<div class="screen" data-name="4 · Share & members">{status()}
  <div class="appbar" style="justify-content:flex-start;gap:12px"><div class="icon-btn">{icon("back", 18, C["text"])}</div><div class="h-title" style="font-size:20px">Share list</div></div>
  <div class="invite"><div class="invite-title">Invite people to Our Home</div>
    <div class="qr-wrap">{qr_html()}</div>
    <div class="linkbox">{icon("link", 18, C["muted"])}<span>basket.app/j/X7K2-9QD</span><div class="copy">{icon("copy", 16, C["text"])}</div></div>
    <div class="btn btn-primary" style="width:100%">{icon("share", 18, "#FFFFFF")}Share invite</div>
    <div class="helper">Anyone with this link can add and tick items.</div></div>
  <div class="section"><span>Members · 4</span></div>
  <div class="card">{members}</div>
  <div class="leave">Leave this list</div>
  {gesture()}</div>'''

CAPS = [
    ("1", "Welcome & join", [("Navigation", "Moving between screens (Expo Router)"),
                             ("Forms", "Text input, buttons, focus states"),
                             ("Storage", "Remember the name on the phone (AsyncStorage)")]),
    ("2", "The shared list", [("Live sync", "Changes appear on every phone (Supabase Realtime)"),
                              ("Lists", "Fast scrolling lists (FlatList) with ticked items"),
                              ("Presence", "Show who is online or shopping right now")]),
    ("3", "Add an item", [("Bottom sheet", "A panel that slides up over the list"),
                          ("Microphone", "Record and play a short voice note (expo-audio)"),
                          ("Reminder", "A phone notification at a set time (expo-notifications)")]),
    ("4", "Share & members", [("Deep links", "basket.app/j/… opens the app on the right list"),
                              ("Share sheet", "The phone's own Share menu (WhatsApp, SMS…)"),
                              ("Ship it", "Build the Android APK and the web version")]),
]

def tokens():
    sw = "".join(f'<div class="sw"><div class="sw-box" style="background:{v}"></div><div class="sw-name">{k.replace("_", "-")}</div><div class="sw-hex">{v}</div></div>' for k, v in C.items())
    types = [("Display · 34/40 · ExtraBold", 34, 800, "Basket"), ("Title · 24/30 · Bold", 24, 700, "Our Home"),
             ("Heading · 20/26 · Bold", 20, 700, "Add item"), ("Body · 16/24 · SemiBold", 16, 600, "Tomatoes"),
             ("Body · 16/24 · Regular", 16, 400, "Add things, and watch them get ticked off"), ("Caption · 13/18 · Regular", 13, 400, "1 kg · added by you")]
    ty = "".join(f'<div class="type-row"><div class="type-meta">{m}</div><div style="font-size:{s}px;font-weight:{w}">{t}</div></div>' for m, s, w, t in types)
    radii = "".join(f'<div><div class="r-box" style="border-radius:{r}px"></div><div class="r-lab">{lab}</div></div>' for r, lab in ((7, "7 · checkbox"), (14, "14 · button"), (16, "16 · card"), (28, "28 · sheet"), (999, "full · chip")))
    return f'''<div class="tokens" data-name="Basket · design tokens">
  <div><div class="tk-h">Basket · practice app</div><div class="tk-p" style="margin-top:6px">A shared household shopping list, built to learn the Android and cross-platform process before Festive Hacks. <b>Not the hackathon project.</b> Frames: Android compact, 412 × 917.</div></div>
  <div class="tk-sec">Colours</div><div class="sw-grid">{sw}</div>
  <div class="tk-sec">Type · Inter</div><div style="display:flex;flex-direction:column;gap:10px">{ty}</div>
  <div class="tk-sec">Corner radius</div><div class="rs">{radii}</div>
  <div class="tk-sec">Spacing</div><div class="tk-p">4 · 8 · 12 · 16 · 20 · 24 · 32. Screen side margin 20. Touch targets at least 40 × 40.</div>
</div>'''

screens = [screen_welcome(), screen_list(), screen_add(), screen_share()]
cols = "".join(f'<div class="col">{s}{caption(n, t, p)}</div>' for s, (n, t, p) in zip(screens, CAPS))
html = f'''<!doctype html><html><head><meta charset="utf-8"><title>Basket</title><style>{CSS}</style></head>
<body><div class="col" style="width:520px">{tokens()}</div>{cols}</body></html>'''
open(sys.argv[1], "w").write(html)
print(len(html), "bytes")
