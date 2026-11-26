import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
const root=process.cwd(), port=Number(process.env.PORT||4174);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.mp4':'video/mp4','.webmanifest':'application/manifest+json'};
const allowed=new Set([
'/index.html','/home.css','/home.js','/video.js','/cardapio/index.html','/cardapio/menu.css','/cardapio/premium.css','/cardapio/reference-fix.css','/compartilhar/index.html','/styles.css','/app.js','/public-ui.js','/public-ui.css','/manifest.webmanifest','/sw.js','/offline.html',
'/admin/index.html','/admin/manifest.webmanifest','/admin/admin.css','/admin/auth.css','/admin/hours-panel.css','/admin/admin-premium.css','/admin/admin.js','/admin/admin-safe.js','/admin/hours-panel.js','/admin/vendor/qrcode.js',
'/data/menu.js','/data/store.js','/data/hours.js','/data/runtime-config.js','/data/oxente-photos.js','/public/vendor/supabase.js',
'/public/assets/oxente-logo-oficial.jpg','/public/assets/oxente-hero.jpg','/public/assets/oxente-cardapio.jpg',
'/public/assets/oxente-video-capa.jpg','/public/assets/oxente-video-thumb.jpg','/public/assets/oxente-apresentacao.mp4',
'/public/assets/oxente-logo-premium.webp','/public/assets/oxente-hero-premium.webp','/public/assets/oxente-cardapio-background-v2.png',
'/public/assets/oxente-menu-premium.webp','/public/assets/oxente-video-premium.webp',
'/public/assets/oxente-menu-wood-demo.webp','/public/assets/oxente-wallpaper-mobile.webp','/public/assets/oxente-wallpaper-desktop.webp','/public/assets/oxente-logo-reference.webp',
'/public/assets/oxente-home-logo-approved.webp','/public/assets/oxente-logo-cliente.png','/public/assets/oxente-logo-cardapio-cordas.png','/public/assets/oxente-home-background-approved.webp','/public/assets/oxente-home-wood-approved.webp',
'/public/assets/beer-ice-overlay.png','/public/assets/beer-laurel.svg','/public/assets/beer-amstel-alpha-mask.png','/public/assets/beer-brahma-alpha-mask.png',
'/public/assets/oxente-home-menu-reference-v2.webp','/public/assets/oxente-home-video-reference-v2.webp','/public/assets/oxente-home-rope-reference-v2.webp',
'/public/assets/brands/whatsapp.svg','/public/assets/brands/instagram.svg','/public/assets/brands/location.svg','/public/assets/brands/ifood.svg'
]);
createServer(async(req,res)=>{
  try{
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return}
    let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(path==='/'||path==='/admin/'||path==='/cardapio/'||path==='/compartilhar/')path+='index.html';
    if(!allowed.has(path)&&!/^\/public\/assets\/products\/[a-z0-9-]+\.webp$/.test(path)&&!/^\/public\/assets\/feature-(v2-)?(beliscar|pastelzinho|bolinhos|do-mar|oxente-refeicoes|tabuas-ou-chapas)-(640|1280)\.webp$/.test(path)&&!/^\/public\/assets\/beer-art-[a-z0-9-]+\.webp$/.test(path)&&!/^\/public\/icons\/[a-z0-9-]+\.png$/.test(path)){res.writeHead(404).end('Não encontrado');return}
    const target=resolve(root,'.'+path);
    if(target!==root&&!target.startsWith(root+sep)){res.writeHead(403).end();return}
    const info=await stat(target);
    if(!info.isFile()){res.writeHead(404).end();return}
    const type=mime[extname(target)]||'application/octet-stream';
    const base={'Content-Type':type,'Cache-Control':'no-store','Accept-Ranges':'bytes',...(path==='/sw.js'?{'Service-Worker-Allowed':'/'}:{})};
    const range=req.headers.range;
    if(range){
      const match=/^bytes=(\d*)-(\d*)$/.exec(range);
      if(!match){res.writeHead(416,{'Content-Range':'bytes */'+info.size}).end();return}
      const start=match[1]?Number(match[1]):Math.max(0,info.size-Number(match[2]));
      const end=match[1]?(match[2]?Number(match[2]):info.size-1):info.size-1;
      if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||end>=info.size){res.writeHead(416,{'Content-Range':'bytes */'+info.size}).end();return}
      res.writeHead(206,{...base,'Content-Range':('bytes '+start+'-'+end+'/'+info.size),'Content-Length':end-start+1});
      if(req.method==='HEAD')res.end();else createReadStream(target,{start,end}).pipe(res);
      return;
    }
    res.writeHead(200,{...base,'Content-Length':info.size});
    if(req.method==='HEAD')res.end();else createReadStream(target).pipe(res);
  }catch{res.writeHead(404).end('Não encontrado')}
}).listen(port,'127.0.0.1',()=>console.log('Oxente local: http://127.0.0.1:'+port+'/'));
