import React, { useState, useMemo, useEffect, useCallback } from "react";

// Supabase config
const SB_URL = "https://plgspjfvalfgfnoizhpm.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsZ3NwamZ2YWxmZ2Zub2l6aHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NTc0MjgsImV4cCI6MjEwMDIzMzQyOH0.nNJ2plajekKvgPcH7-R2maOrvp4urxcN5zRUqUUv8J0";
const SB_HEADERS = { "Content-Type": "application/json", "apikey": SB_KEY, "Authorization": "Bearer " + SB_KEY };

async function sbGet() {
  try {
    const r = await fetch(SB_URL + "/rest/v1/customers?select=*&order=created_at.asc", { headers: SB_HEADERS });
    if (!r.ok) return null;
    const rows = await r.json();
    // Filter out test rows and parse data field
    const customers = rows
      .filter(row => row.data && row.data !== "hello" && row.data !== "world")
      .map(row => {
        try { return JSON.parse(row.data); }
        catch(e) { return null; }
      })
      .filter(Boolean);
    return customers;
  } catch(e) { console.error("sbGet error:", e); return null; }
}
async function sbUpsert(customer) {
  try {
    const r = await fetch(SB_URL + "/rest/v1/customers?on_conflict=cid", {
      method: "POST",
      headers: { ...SB_HEADERS, "Prefer": "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(customer)
    });
    if (!r.ok) {
      const err = await r.text();
      console.error("Supabase error:", r.status, err);
    }
    return r.ok;
  } catch(e) { console.error("sbUpsert failed:", e); return false; }
}
async function sbDelete(id) {
  try {
    const r = await fetch(SB_URL + "/rest/v1/customers?cid=eq." + encodeURIComponent(id), {
      method: "DELETE", headers: SB_HEADERS
    });
    return r.ok;
  } catch(e) { return false; }
}

function makeS(dark) {
  const bg=dark?"#0f1117":"#f0f4f8",card=dark?"rgba(255,255,255,0.04)":"#fff";
  const b=dark?"rgba(255,255,255,0.07)":"#e2e8f0",b2=dark?"rgba(255,255,255,0.1)":"#cbd5e0";
  const tx=dark?"#fff":"#1a202c",sub=dark?"rgba(255,255,255,0.45)":"#718096";
  const mut=dark?"rgba(255,255,255,0.28)":"#a0aec0",inp=dark?"rgba(255,255,255,0.05)":"#fff";
  const btnBg=dark?"rgba(255,255,255,0.05)":"#f7fafc",btnB=dark?"rgba(255,255,255,0.1)":"#e2e8f0";
  const tabBg=dark?"rgba(18,20,30,0.92)":"rgba(255,255,255,0.96)";
  return {
    root:{minHeight:"100vh",background:bg,fontFamily:"'Noto Sans TC',sans-serif",position:"relative",overflow:"hidden"},
    bgD1:{position:"fixed",top:-120,right:-120,width:400,height:400,borderRadius:"50%",background:dark?"radial-gradient(circle,rgba(52,152,219,0.13) 0%,transparent 70%)":"none",pointerEvents:"none"},
    bgD2:{position:"fixed",bottom:-80,left:-80,width:300,height:300,borderRadius:"50%",background:dark?"radial-gradient(circle,rgba(231,76,60,0.1) 0%,transparent 70%)":"none",pointerEvents:"none"},
    container:{maxWidth:480,margin:"0 auto",padding:"0 0 80px",position:"relative",zIndex:1},
    header:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 16px 14px",borderBottom:`1px solid ${b}`,marginBottom:4,background:dark?"transparent":"#fff"},
    headerL:{display:"flex",alignItems:"center",gap:10},headerR:{display:"flex",gap:8},
    backBtn:{background:dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)",border:"none",color:tx,width:34,height:34,borderRadius:9,fontSize:17,cursor:"pointer"},
    subtitle:{fontSize:15,fontWeight:600,color:sub},
    addBtn:{background:"linear-gradient(135deg,#3498db,#2980b9)",border:"none",color:"#fff",padding:"9px 15px",borderRadius:9,fontSize:14,fontWeight:600,cursor:"pointer"},
    outlineBtn:{background:dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.05)",border:`1px solid ${b}`,color:tx,padding:"8px 12px",borderRadius:9,fontSize:12,cursor:"pointer"},
    statsRow:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"12px 14px"},
    statCard:{background:card,border:`1px solid ${b}`,borderRadius:12,padding:"14px 10px",textAlign:"center",boxShadow:dark?"none":"0 1px 4px rgba(0,0,0,0.06)"},
    statIcon:{fontSize:20,marginBottom:4},statValue:{fontSize:22,fontWeight:800},statLabel:{fontSize:11,color:mut,marginTop:2},
    searchWrap:{padding:"6px 14px 10px"},
    searchInput:{width:"100%",boxSizing:"border-box",background:inp,border:`1px solid ${b2}`,borderRadius:10,padding:"11px 14px",color:tx,fontSize:14,outline:"none"},
    hint:{textAlign:"center",color:mut,padding:"36px 20px",fontSize:15},
    cardList:{padding:"0 14px",display:"flex",flexDirection:"column",gap:9},
    card:{background:card,border:`1px solid ${b}`,borderRadius:13,padding:"13px",display:"flex",alignItems:"center",gap:11,cursor:"pointer",boxShadow:dark?"none":"0 1px 4px rgba(0,0,0,0.06)"},
    cardAvatar:{width:44,height:44,borderRadius:11,background:"linear-gradient(135deg,#3498db,#2ecc71)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,fontWeight:700,color:"#fff",flexShrink:0},
    cardInfo:{flex:1,minWidth:0},cardName:{fontSize:17,fontWeight:600,color:tx},
    cardSub:{fontSize:13,color:sub,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},
    cardTags:{display:"flex",gap:5,marginTop:5,flexWrap:"wrap"},cardRight:{textAlign:"right",flexShrink:0},
    cardAmount:{fontSize:17,fontWeight:700,color:"#2ecc71"},cardDateLabel:{fontSize:10,color:mut,marginTop:4},cardDate:{fontSize:10,color:sub,marginTop:1},
    tagBlue:{fontSize:12,padding:"2px 7px",borderRadius:6,background:"rgba(52,152,219,0.2)",color:"#3498db",fontWeight:600},
    tagGray:{fontSize:12,padding:"2px 7px",borderRadius:6,background:dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)",color:sub},
    tagPayment:{fontSize:12,padding:"2px 7px",borderRadius:6,background:"rgba(231,76,60,0.18)",color:"#e74c3c",fontWeight:600},
    detail:{padding:"16px"},
    detailHero:{textAlign:"center",padding:"16px 0 18px",borderBottom:`1px solid ${b}`,marginBottom:16},
    detailAvatar:{width:64,height:64,borderRadius:18,background:"linear-gradient(135deg,#3498db,#2ecc71)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:700,color:"#fff",margin:"0 auto 10px"},
    detailName:{fontSize:26,fontWeight:700,color:tx},detailPhone:{fontSize:15,color:sub,marginTop:3},detailNote:{fontSize:12,color:mut,marginTop:10},
    badge:{fontSize:12,padding:"4px 12px",borderRadius:20,background:"rgba(52,152,219,0.15)",color:"#3498db",fontWeight:500},
    badgeGray:{fontSize:12,padding:"4px 12px",borderRadius:20,background:dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)",color:sub},
    summaryRow:{display:"flex",background:card,border:`1px solid ${b}`,borderRadius:12,marginBottom:18,overflow:"hidden"},
    summaryItem:{flex:1,textAlign:"center",padding:"13px 8px",borderRight:`1px solid ${b}`},
    summaryValue:{fontSize:16,fontWeight:700,color:tx},summaryLabel:{fontSize:10,color:mut,marginTop:3},
    sectionTitle:{fontSize:14,fontWeight:600,color:mut,marginBottom:10,letterSpacing:0.5},
    visitCard:{background:card,border:`1px solid ${b}`,borderRadius:12,padding:"13px 14px",marginBottom:9},
    visitTop:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8},
    visitDate:{fontSize:16,fontWeight:600,color:tx},visitAmount:{fontSize:18,fontWeight:700,color:"#2ecc71"},
    visitServices:{display:"flex",flexWrap:"wrap",gap:7,marginBottom:7},visitNote:{fontSize:14,color:mut,marginBottom:6,marginTop:4},
    visitActions:{display:"flex",gap:8,marginTop:10},
    visitEditBtn:{flex:1,padding:"7px",background:"rgba(52,152,219,0.12)",border:"1px solid rgba(52,152,219,0.25)",color:"#3498db",borderRadius:8,fontSize:12,cursor:"pointer"},
    visitDeleteBtn:{flex:1,padding:"7px",background:"rgba(231,76,60,0.08)",border:"1px solid rgba(231,76,60,0.2)",color:"#e74c3c",borderRadius:8,fontSize:12,cursor:"pointer"},
    deleteBtnFull:{width:"100%",marginTop:20,background:"rgba(231,76,60,0.1)",border:"1px solid rgba(231,76,60,0.25)",color:"#e74c3c",padding:"12px",borderRadius:11,fontSize:13,cursor:"pointer",fontWeight:500},
    formWrap:{padding:"14px 16px"},formTitle:{fontSize:18,fontWeight:700,color:tx,marginBottom:18},
    formField:{marginBottom:15},formLabel:{display:"block",fontSize:13,color:sub,marginBottom:6,fontWeight:500},
    selectInput:{width:"100%",boxSizing:"border-box",background:inp,border:`1px solid ${b2}`,borderRadius:9,padding:"10px 13px",color:tx,fontSize:14,outline:"none",fontFamily:"inherit",cursor:"pointer"},
    input:{width:"100%",maxWidth:"100%",boxSizing:"border-box",background:inp,border:`1px solid ${b2}`,borderRadius:9,padding:"11px 14px",color:tx,fontSize:16,outline:"none",fontFamily:"inherit"},
    radioGroup:{display:"flex",flexWrap:"wrap",gap:7},
    radioBtn:{padding:"8px 14px",borderRadius:9,background:btnBg,border:`1px solid ${btnB}`,color:sub,fontSize:14,cursor:"pointer"},
    radioBtnActive:{background:"rgba(52,152,219,0.22)",border:"1px solid #3498db",color:"#3498db",fontWeight:600},
    catLabel:{fontSize:11,fontWeight:600,color:mut,marginBottom:6,letterSpacing:0.5,textTransform:"uppercase"},
    serviceGrid:{display:"flex",flexWrap:"wrap",gap:7},
    serviceBtn:{padding:"8px 13px",borderRadius:9,background:btnBg,border:`1px solid ${btnB}`,color:sub,fontSize:14,cursor:"pointer"},
    serviceBtnActive:{background:"rgba(52,152,219,0.18)",border:"1px solid rgba(52,152,219,0.55)",color:"#3498db",fontWeight:600},
    formBtns:{display:"flex",gap:10,marginTop:22},
    btnCancel:{flex:1,padding:"12px",background:btnBg,border:`1px solid ${btnB}`,color:sub,borderRadius:11,fontSize:14,cursor:"pointer"},
    btnSave:{flex:2,padding:"12px",background:"linear-gradient(135deg,#3498db,#2980b9)",border:"none",color:"#fff",borderRadius:11,fontSize:14,fontWeight:700,cursor:"pointer"},
    btnDanger:{flex:1,padding:"10px",background:"#c0392b",border:"none",color:"#fff",borderRadius:9,fontSize:14,fontWeight:600,cursor:"pointer"},
    overlay:{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:20},
    modal:{background:dark?"#1a1d26":"#fff",border:`1px solid ${b}`,borderRadius:15,padding:"26px 22px",maxWidth:320,width:"100%",textAlign:"center"},
    modalTitle:{fontSize:17,fontWeight:700,color:tx,marginBottom:7},modalText:{fontSize:13,color:sub,lineHeight:1.6,marginBottom:18},modalBtns:{display:"flex",gap:9},
    recentTitle:{fontSize:11,fontWeight:600,color:mut,padding:"4px 14px 8px",letterSpacing:0.5},
    analyticsBanner:{margin:"6px 14px 4px",borderRadius:16,background:dark?"linear-gradient(160deg,rgba(52,152,219,0.18) 0%,rgba(46,204,113,0.1) 100%)":"linear-gradient(160deg,rgba(52,152,219,0.1) 0%,rgba(46,204,113,0.06) 100%)",border:"1px solid rgba(52,152,219,0.28)",padding:"18px 16px 14px",cursor:"pointer",minHeight:"35vh",display:"flex",flexDirection:"column",justifyContent:"center",position:"relative"},
    analyticsBannerTitle:{fontSize:16,fontWeight:700,color:tx,marginBottom:3},analyticsBannerSub:{fontSize:12,color:sub},
    analyticsBannerArrowBottom:{position:"absolute",bottom:12,right:16,fontSize:20,color:mut},
    analyticsHeader:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px 8px",flexWrap:"wrap",gap:8},
    backBtnSm:{background:dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.06)",border:`1px solid ${b}`,color:tx,padding:"7px 14px",borderRadius:9,fontSize:13,cursor:"pointer"},
    rangeSelect:{background:dark?"rgba(255,255,255,0.07)":"#fff",border:`1px solid ${b}`,color:tx,padding:"7px 12px",borderRadius:9,fontSize:13,outline:"none",cursor:"pointer"},
    orderCard:{background:card,border:`1px solid ${b}`,borderRadius:11,padding:"11px 13px",marginBottom:8,cursor:"pointer"},
    orderTop:{display:"flex",alignItems:"center",gap:8,marginBottom:5},
    orderNo:{fontSize:10,color:mut,minWidth:28},orderPlate:{fontSize:14,fontWeight:700,color:"#3498db",flex:1},
    orderDate:{fontSize:12,color:sub},orderAmt:{fontSize:15,fontWeight:700,color:"#2ecc71"},orderName:{fontSize:13,color:sub,marginBottom:5},
    placeholderWrap:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 20px"},
    placeholderText:{fontSize:14,color:mut},
    tabBar:{position:"fixed",bottom:0,left:0,right:0,zIndex:50},
    tabBarInner:{maxWidth:480,margin:"0 auto",display:"flex",alignItems:"flex-end",background:tabBg,backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderTop:`1px solid ${b}`,height:68,position:"relative",boxShadow:"0 -4px 20px rgba(0,0,0,0.1)"},
    tabBtn:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",paddingBottom:10,background:"transparent",border:"none",cursor:"pointer",position:"relative",height:"100%"},
    tabBtnActive:{},
    tabBubble:{width:46,height:46,borderRadius:"50%",background:"#3498db",display:"flex",alignItems:"center",justifyContent:"center",position:"absolute",top:-8,left:"50%",transform:"translateX(-50%)",boxShadow:"0 3px 10px rgba(52,152,219,0.4)"},
    tabIcon:{display:"flex",alignItems:"center",justifyContent:"center",marginBottom:2},
    tabDot:{width:4,height:4,borderRadius:"50%",background:"#3498db"},
    tabIconColor:(active)=>active?"#fff":(dark?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.35)"),
    tabIconColorInactive:(dark?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.35)"),
    toast:{position:"fixed",top:18,left:"50%",transform:"translateX(-50%)",color:"#fff",padding:"11px 22px",borderRadius:11,fontSize:13,fontWeight:600,zIndex:200,whiteSpace:"nowrap"},
    // theme primitives - accessible as S.text, S.sub, S.muted
    text:tx, sub, muted:mut, inputBg:inp,
  };
}


const CAR_BRANDS = {
  "Toyota 豐田":["86","Vios","小Yaris","Altis","Auris","Prius","Supra","大Yaris","Chr","Camry","Crown","RAV4","Prada","CC","Prius α","Sienta","Wish","Innova","Granvia","Hlace","Hilux","Alphard","Sienna","Previa"],
  "Hyundai 現代":["Elantra","Ioniq","Velostor","Verna","Genesis","Kona","Venue","Tucson","Santa Fe","Ix35","Ioniq5","Custin","Staria","Grandstarex"],
  "Ford 福特":["Fiesta","Focus","Escort","Mondeo","野馬","Wagon車系","Kuga","Ecosport","旅行家","Ranger"],
  "Mazda 馬自達":["Mazda2","Mazda3","Mx-5","Mazda6","Wagon","Cx-3","CX30","Mazda5","Tribute","Cx5","Cx7","CX60","Cx-9","Mpv"],
  "Honda 本田":["City","Civic","Insight","Fit","Hrv","Nsx","Accord","CR-V","Odyssey"],
  "Kia 起亞":["Picanto","Morning","Soul","Stinger","Stonic","EV6","Carens","Sportage","Sorento","Carnival"],
  "Nissan 日產":["350z","370z","March","Tlida","Leaf","Sentra","Juke","Livina","Gtr","Teana","Altima","Kicks","X-trail","Rogue","Q-RV","Quest"],
  "Mitsubishi 三菱":["Lancer","Colt plus","Eclipse Cross","Outland","Savrin","Zinger","Pajero","Algo"],
  "Infiniti 無限":["Q60","Q70","Q50","G37","Q30","Qx30","Qx50","Qx60","Qx70","Ex","Fx","Jx35"],
  "Suzuki 鈴木":["Swift","Ignis","Baleno","Jimny","Vitara","SX4"],
  "Benz 賓士":["A系","C系","E系","S系","CLA","SLS","SLK","CLS","GLA","CL","EQE","EQS","AMGgtr","Wagon","GLC/E/B系","M系","EQA","EQB","EQESUV","GLS","V系"],
  "Volkswagen 福斯":["Polo","Beetle","Vento","ID.3","Jetta","Golf","Golf plus","Phaeton","T-ROC","Variant","T-Cross","Passat","CC","路旅車系","Arteon","Tiguan","Touran","Touareg","Multivan","T4","T5","Caddy","Freestyle","露車"],
  "Luxgen 納智捷":["U5","U6","U7","N7","URX"],
  "Skoda 斯柯達":["Fabia","Citigo","Octavia","Octavia combi","Rapid","Superb","Fabia combi","Yeti","Kamiq","SCALA","Karoq","Kodiaq","Roomster"],
  "Land Rover 路虎":["EVOQUE","大型豪華越野"],
  "Hummer 悍馬":["大型越野"],
  "Volvo 富豪":["C30","S40","V40","C70","S60","S80","S90","V50","V60","V70","V90","XC40","XC60","XC90"],
  "Peugeot 寶獅":["1系","2系","3系","4系","Rcz","208","207","307","301","508","5008","3008","2008","Traveller"],
  "BMW 寶馬":["X1","X2","X3","X4","X5","X6","1系","2系","3系","4系","5系","6系","7系","8系","M3","M4","M5","IX","X7","I系列"],
  "Audi 奧迪":["A1","A3","A4","A5","A6","A7","A8","TT","Q2","Q3","Q5","Q7","Q8","E-tron GT","E-tron Q8"],
  "Lexus 凌志":["IS","GS","LBX","CT","RC","LC","ES","UX","NX","RX","LX","LS"],
  "Opel 歐寶":["Mokka"],
  "Bentley 賓利":["Continental","Mulsanne","Flyingspur","Bentayga"],
  "Maserati 瑪莎拉蒂":["Ghibli","Quattroporte","Granturismo","Grancabrio","Levante"],
  "Ferrari 法拉利":["中型豪華"],
  "Subaru 速霸陸":["Impreza","Legacy","BRZ","XV","Levorg","Crosstre","Wrx","Forester","Outback","Solterra"],
  "Porsche 保時捷":["718","911","Panamera","Macan","Taycan","Cayenne"],
  "Lamborghini 藍寶堅尼":["Aventador","Huracan","Urus"],
  "Aston Martin 奧斯頓馬丁":["中型豪華"],
  "McLaren 麥拉倫":["中型豪華"],
  "Jaguar 捷豹":["XE","XJ","XF","F-type","E-pace","F-pace"],
  "Mini 迷你":["Mini","Hatch","Clubman","Countryman","Paceman"],
  "Tesla 特斯拉":["Model 3","Model S","Model X","Model Y"],
  "其他":["其他車型"],
};

const serviceCategories = [
  { label:"🚿 車漆護理", items:["一般洗車","精緻深層"] },
  { label:"✨ 專業美容", items:["大美容","小美容","車室深層"] },
  { label:"💎 鍍膜", items:["全車鍍膜","客製鍍膜"] },
  { label:"➕ 其他加購", items:["臭氧除臭","前玻璃鍍膜","前後玻璃鍍膜","全車玻璃鍍膜","局部內裝清洗","刮傷處理"] },
  { label:"❗️ 特殊處理", items:["螞蟻處理","嘔吐"] },
];
const paymentOptions = ["現金","信用卡","Line Pay","Apple Pay","轉帳"];

const CAT_COATING=["全車鍍膜","客製鍍膜"];
const CAT_BEAUTY=["大美容","小美容","車室深層"];
const CAT_ADDON=["臭氧除臭","前玻璃鍍膜","前後玻璃鍍膜","全車玻璃鍍膜","局部內裝清洗","刮傷處理","螞蟻處理","嘔吐"];
const CAT_WASH=["一般洗車","精緻深層"];

function classifyService(s){
  if(CAT_COATING.includes(s)) return "coating";
  if(CAT_BEAUTY.includes(s)) return "beauty";
  if(CAT_ADDON.includes(s)) return "addon";
  return "wash";
}

const RANGE_OPTS=[
  {key:"today",label:"當日"},{key:"week",label:"本週"},
  {key:"month",label:"月份"},{key:"halfyear",label:"半年"},{key:"year",label:"一年"},
];
function getMonthOptions(){
  const now=new Date(); const opts=[];
  for(let m=0;m<=now.getMonth();m++){
    const val=`${now.getFullYear()}-${String(m+1).padStart(2,"0")}`;
    opts.push({val,label:`${now.getFullYear()}年${m+1}月`});
  }
  return opts.reverse();
}
function getRangeDates(range,selectedMonth){
  const now=new Date(); const today=now.toISOString().slice(0,10);
  if(range==="today") return {from:today,to:today};
  if(range==="week"){
    const mon=new Date(now); mon.setDate(mon.getDate()-mon.getDay()+1);
    const monthStart=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-01`;
    const from=mon.toISOString().slice(0,10)<monthStart?monthStart:mon.toISOString().slice(0,10);
    return {from,to:today};
  }
  if(range==="month"&&selectedMonth){
    const [y,m]=selectedMonth.split("-").map(Number);
    const from=`${y}-${String(m).padStart(2,"0")}-01`;
    const lastDay=new Date(y,m,0).getDate();
    return {from,to:`${y}-${String(m).padStart(2,"0")}-${lastDay}`};
  }
  const d=new Date(now);
  if(range==="halfyear") d.setMonth(d.getMonth()-6);
  if(range==="year") d.setFullYear(d.getFullYear()-1);
  return {from:d.toISOString().slice(0,10),to:today};
}
function getVisitsInRange(customers,range,selectedMonth){
  const {from,to}=getRangeDates(range,selectedMonth);
  const all=[];
  customers.forEach(c=>c.visits.forEach(v=>{
    if(v.date>=from&&v.date<=to)
      all.push({...v,customerName:c.name,licensePlate:v.visitLicensePlate||c.licensePlate,customerId:c.id});
  }));
  return all.sort((a,b)=>b.date.localeCompare(a.date));
}

function formatUpdated(iso){
  const d=new Date(iso);
  return `${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}
function makeEmptyVisitForm(){
  const now=new Date();
  return {date:now.toISOString().slice(0,10),time:now.toTimeString().slice(0,5),services:[],paymentMethod:"現金",amount:"",note:"",visitLicensePlate:"",staff:""};
}
const emptyCustomerForm={name:"",phone:"",carBrand:"",carModel:"",licensePlate:"",note:"",vehicles:[]};

const initialCustomers=[
  {id:1,name:"陳大明",phone:"0912-345-678",carModel:"Toyota Camry",licensePlate:"ABC-1234",
   vehicles:[{brand:"Toyota 豐田",model:"Camry",licensePlate:"ABC-1234"}],
   note:"對車漆非常講究",updatedAt:"2026-03-28T10:30:00",
   visits:[
    {id:103,date:"2026-03-28",time:"10:30",services:["大美容","前玻璃鍍膜"],paymentMethod:"信用卡",amount:3200,note:"",visitLicensePlate:"ABC-1234"},
    {id:102,date:"2026-02-15",time:"14:00",services:["精緻深層","臭氧除臭"],paymentMethod:"信用卡",amount:1800,note:"有寵物毛",visitLicensePlate:"ABC-1234"},
    {id:101,date:"2026-01-10",time:"09:00",services:["一般洗車"],paymentMethod:"信用卡",amount:500,note:"",visitLicensePlate:"ABC-1234"},
   ]},
  {id:2,name:"林小美",phone:"0923-456-789",carModel:"BMW 3系列",licensePlate:"XYZ-5678",
   vehicles:[{brand:"BMW 寶馬",model:"3系列",licensePlate:"XYZ-5678"}],
   note:"",updatedAt:"2026-03-20T14:00:00",
   visits:[
    {id:201,date:"2026-03-20",time:"11:00",services:["全車鍍膜"],paymentMethod:"現金",amount:12000,note:"新車鍍膜",visitLicensePlate:"XYZ-5678"},
   ]},
  {id:3,name:"王建國",phone:"0934-567-890",carModel:"Honda CR-V",licensePlate:"DEF-9012",
   vehicles:[{brand:"Honda 本田",model:"CR-V",licensePlate:"DEF-9012"}],
   note:"每月固定來",updatedAt:"2026-04-01T09:15:00",
   visits:[
    {id:304,date:"2026-04-01",time:"09:15",services:["精緻深層"],paymentMethod:"Line Pay",amount:1200,note:"",visitLicensePlate:"DEF-9012"},
    {id:303,date:"2026-03-02",time:"10:30",services:["一般洗車","局部內裝清洗"],paymentMethod:"Line Pay",amount:900,note:"",visitLicensePlate:"DEF-9012"},
    {id:302,date:"2026-02-03",time:"11:00",services:["一般洗車"],paymentMethod:"Line Pay",amount:400,note:"",visitLicensePlate:"DEF-9012"},
    {id:301,date:"2026-01-05",time:"09:30",services:["一般洗車"],paymentMethod:"Line Pay",amount:400,note:"",visitLicensePlate:"DEF-9012"},
   ]},
];


// ── TWDatePicker ──────────────────────────────────────────────
function TWDatePicker({S,value,onChange,style}){
  const [open,setOpen]=useState(false);
  const [vy,setVy]=useState(()=>value?parseInt(value.slice(0,4)):new Date().getFullYear());
  const [vm,setVm]=useState(()=>value?parseInt(value.slice(5,7))-1:new Date().getMonth());
  const TWwd=["一","二","三","四","五","六","日"];
  const today=new Date().toISOString().slice(0,10);
  const dim=new Date(vy,vm+1,0).getDate();
  const fd=new Date(vy,vm,1).getDay(); const offset=fd===0?6:fd-1;
  const fmt=value?`${value.slice(0,4)}/${value.slice(5,7)}/${value.slice(8,10)}`:"選擇日期";
  return (
    <div style={{position:"relative",...style}}>
      <button type="button" style={{width:"100%",boxSizing:"border-box",background:S.input.background,border:S.input.border,borderRadius:9,padding:"11px 14px",color:value?S.input.color:"rgba(150,150,150,0.8)",fontSize:15,textAlign:"left",cursor:"pointer"}}
        onClick={()=>setOpen(o=>!o)}>📅 {fmt}</button>
      {open&&(
        <div style={{position:"absolute",zIndex:999,top:"calc(100% + 6px)",left:0,right:0,background:S.modal.background,border:S.card.border,borderRadius:14,padding:"12px",boxShadow:"0 8px 32px rgba(0,0,0,0.4)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <button style={{background:"none",border:"none",color:S.text,fontSize:18,cursor:"pointer",padding:"0 8px"}}
              onClick={()=>{if(vm===0){setVm(11);setVy(y=>y-1);}else setVm(m=>m-1);}}>‹</button>
            <span style={{fontSize:15,fontWeight:700,color:S.text}}>{vy}年{vm+1}月</span>
            <button style={{background:"none",border:"none",color:S.text,fontSize:18,cursor:"pointer",padding:"0 8px"}}
              onClick={()=>{if(vm===11){setVm(0);setVy(y=>y+1);}else setVm(m=>m+1);}}>›</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:4}}>
            {TWwd.map(w=><div key={w} style={{textAlign:"center",fontSize:12,color:S.muted,padding:"2px 0"}}>{w}</div>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
            {Array.from({length:offset}).map((_,i)=><div key={`e${i}`}/>)}
            {Array.from({length:dim}).map((_,i)=>{
              const d=i+1;
              const iso=`${vy}-${String(vm+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
              const sel=iso===value,isT=iso===today;
              return <button key={iso} type="button"
                style={{textAlign:"center",padding:"6px 2px",borderRadius:7,border:"none",cursor:"pointer",fontSize:14,fontWeight:sel?700:400,
                  background:sel?"#3498db":isT?"rgba(52,152,219,0.2)":"transparent",color:sel?"#fff":isT?"#3498db":S.text}}
                onClick={()=>{onChange(iso);setOpen(false);}}>{d}</button>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── DonutChart ────────────────────────────────────────────────
function DonutChart({S,slices,total,totalAmount}){
  const size=240,R=95,sw=28,cx=120,cy=120;
  const circ=2*Math.PI*R; let off=0;
  const segs=slices.map(s=>{const dash=(total>0?s.count/total:0)*circ;const seg={...s,dash,off};off+=dash;return seg;});
  return (
    <div style={{position:"relative",width:size,height:size,margin:"0 auto"}}>
      <svg width={size} height={size}>
        {total===0?<circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={sw}/>:
          segs.map(seg=><circle key={seg.key} cx={cx} cy={cy} r={R} fill="none" stroke={seg.color} strokeWidth={sw}
            strokeDasharray={`${seg.dash} ${circ-seg.dash}`} strokeDashoffset={-seg.off}
            style={{transform:"rotate(-90deg)",transformOrigin:"50% 50%",transition:"stroke-dasharray 0.5s"}}/>)}
        <circle cx={cx} cy={cy} r={R-sw/2+1} fill={S.root.background}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <div style={{fontSize:38,fontWeight:800,color:"#fff",lineHeight:1}}>{total}</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:4}}>台</div>
        <div style={{fontSize:15,fontWeight:700,color:"#2ecc71",marginTop:8}}>${totalAmount.toLocaleString()} 元</div>
      </div>
    </div>
  );
}

// ── HomeMain ──────────────────────────────────────────────────
function HomeMain({S,customers,totalCustomers,thisMonthVisits,onOpenAnalytics,onGoDetail,formatUpdated}){
  const oneWeekAgo=new Date(); oneWeekAgo.setDate(oneWeekAgo.getDate()-7);
  const recent=[...customers].filter(c=>c.updatedAt>=oneWeekAgo.toISOString()).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,8);
  const now=new Date();
  return (
    <div>
      <div style={S.statsRow}>
        <div style={{...S.statCard,borderTop:"3px solid #3498db"}}>
          <div style={S.statIcon}>👥</div>
          <div style={{...S.statValue,color:"#3498db"}}>{totalCustomers}</div>
          <div style={S.statLabel}>總客戶人數</div>
        </div>
        <div style={{...S.statCard,borderTop:"3px solid #e67e22"}}>
          <div style={S.statIcon}>📅</div>
          <div style={{fontSize:11,color:"#e67e22",fontWeight:700,marginBottom:2}}>{now.getMonth()+1}月</div>
          <div style={{...S.statValue,color:"#e67e22"}}>{thisMonthVisits}</div>
          <div style={S.statLabel}>本月來店次數</div>
        </div>
      </div>
      <div style={S.analyticsBanner} onClick={onOpenAnalytics}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
          <div style={{position:"relative",width:90,height:90}}>
            <svg width="90" height="90" viewBox="0 0 90 90">
              {[{color:"#3498db",pct:0.3},{color:"#9b59b6",pct:0.25},{color:"#e67e22",pct:0.25},{color:"#2ecc71",pct:0.2}].reduce((acc,seg)=>{
                const R2=34,circ=2*Math.PI*R2,dash=seg.pct*circ,off2=-acc.offset;
                acc.els.push(<circle key={seg.color} cx="45" cy="45" r={R2} fill="none" stroke={seg.color} strokeWidth="14"
                  strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={off2}
                  style={{transform:"rotate(-90deg)",transformOrigin:"50% 50%"}}/>);
                acc.offset+=dash; return acc;
              },{els:[],offset:0}).els}
              <circle cx="45" cy="45" r="27" fill={S.root.background}/>
            </svg>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:11,color:S.sub,fontWeight:600}}>分析</span>
            </div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"center",gap:5,height:48,marginBottom:14}}>
          {[30,55,40,72,48,80,58].map((h,i)=><div key={i} style={{width:10,height:h*0.6,borderRadius:4,background:i===5?"#3498db":"rgba(52,152,219,0.28)"}}/>)}
        </div>
        <div style={{textAlign:"center"}}>
          <div style={S.analyticsBannerTitle}>📊 統計報表</div>
          <div style={S.analyticsBannerSub}>點擊查看服務分析與工單明細</div>
        </div>
        <div style={S.analyticsBannerArrowBottom}>›</div>
      </div>
      <div style={S.recentTitle}>最近客戶（一週內）</div>
      {recent.length===0&&<div style={S.hint}>近一週無來店紀錄</div>}
      <div style={S.cardList}>
        {recent.map(c=>{
          const totalSpent=c.visits.reduce((s,v)=>s+v.amount,0);
          return (
            <div key={c.id} style={S.card} onClick={()=>onGoDetail(c)}>
              <div style={S.cardAvatar}>{c.name[0]}</div>
              <div style={S.cardInfo}>
                <div style={S.cardName}>{c.name}</div>
                <div style={S.cardSub}>{c.phone} · {c.carModel||"未填車型"}</div>
                <div style={S.cardTags}>
                  {c.visits.length>0&&<span style={S.tagBlue}>{c.visits[0].services[0]}</span>}
                  <span style={S.tagGray}>共{c.visits.length}次</span>
                </div>
              </div>
              <div style={S.cardRight}>
                <div style={S.cardAmount}>${totalSpent.toLocaleString()}</div>
                <div style={S.cardDateLabel}>最後編輯</div>
                <div style={S.cardDate}>{formatUpdated(c.updatedAt)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── HomeAnalytics ─────────────────────────────────────────────
function HomeAnalytics({S,customers,statsRange,setStatsRange,onBack,onGoDetail}){
  const now=new Date();
  const defaultMonth=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const [selMonth,setSelMonth]=useState(defaultMonth);
  const monthOpts=getMonthOptions();
  const visits=getVisitsInRange(customers,statsRange,selMonth);
  const cats={coating:0,addon:0,beauty:0,wash:0};
  visits.forEach(v=>{
    const svcs=v.services; let primary="addon";
    if(svcs.some(s=>CAT_WASH.includes(s))) primary="wash";
    if(svcs.some(s=>CAT_BEAUTY.includes(s))) primary="beauty";
    if(svcs.some(s=>CAT_COATING.includes(s))) primary="coating";
    cats[primary]++;
  });
  const totalCars=visits.length, totalAmt=visits.reduce((s,v)=>s+v.amount,0);
  const CAT_COLORS={coating:"#3498db",addon:"#e67e22",beauty:"#9b59b6",wash:"#2ecc71"};
  const CAT_BG={coating:"rgba(52,152,219,0.2)",addon:"rgba(230,126,34,0.2)",beauty:"rgba(155,89,182,0.2)",wash:"rgba(46,204,113,0.2)"};
  const allSlices=[
    {key:"coating",label:"鍍膜",color:CAT_COLORS.coating,count:cats.coating},
    {key:"addon",label:"加購",color:CAT_COLORS.addon,count:cats.addon},
    {key:"beauty",label:"美容",color:CAT_COLORS.beauty,count:cats.beauty},
    {key:"wash",label:"洗車",color:CAT_COLORS.wash,count:cats.wash},
  ];
  const activeSlices=allSlices.filter(s=>s.count>0);
  return (
    <div style={{paddingBottom:20}}>
      <div style={S.analyticsHeader}>
        <button style={S.backBtnSm} onClick={onBack}>← 返回</button>
        <select style={S.rangeSelect} value={statsRange} onChange={e=>setStatsRange(e.target.value)}>
          {RANGE_OPTS.map(o=><option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
      </div>
      {statsRange==="month"&&(
        <div style={{padding:"0 14px 6px",display:"flex",justifyContent:"flex-end"}}>
          <select style={S.rangeSelect} value={selMonth} onChange={e=>setSelMonth(e.target.value)}>
            {monthOpts.map(o=><option key={o.val} value={o.val}>{o.label}</option>)}
          </select>
        </div>
      )}
      <div style={{padding:"10px 14px 4px",display:"flex",justifyContent:"center"}}>
        <DonutChart S={S} slices={activeSlices} total={totalCars} totalAmount={totalAmt}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 12px",padding:"10px 20px 16px"}}>
        {allSlices.map(s=>(
          <div key={s.key} style={{display:"flex",alignItems:"center",gap:8,background:S.statCard.background,borderRadius:10,padding:"8px 12px",border:`1px solid ${s.count>0?s.color+"44":"rgba(255,255,255,0.06)"}`}}>
            <div style={{width:12,height:12,borderRadius:4,background:s.count>0?s.color:"rgba(255,255,255,0.15)",flexShrink:0}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:11,color:S.muted}}>{s.label}</div>
              <div style={{fontSize:15,fontWeight:700,color:s.count>0?s.color:"rgba(255,255,255,0.2)"}}>{s.count}台</div>
            </div>
            <div style={{fontSize:12,fontWeight:600,color:s.count>0?s.color:"rgba(255,255,255,0.2)"}}>{totalCars>0?Math.round(s.count/totalCars*100):0}%</div>
          </div>
        ))}
      </div>
      <div style={{padding:"0 14px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={S.sectionTitle}>📋 工單明細</div>
          {visits.length>0&&(
            <button
              style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",background:"linear-gradient(135deg,#27ae60,#2ecc71)",border:"none",borderRadius:9,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:"0 2px 8px rgba(46,204,113,0.35)"}}
              onClick={()=>{
                const rangeLabelMap={today:"當日",week:"本週",month:selMonth||"月份",halfyear:"半年",year:"一年"};
                const rangeLabel=rangeLabelMap[statsRange]||statsRange;
                const headers=["編號","日期","時間","車牌","客戶名","服務項目","消費方式","金額(NT$)"];
                const rows=visits.map((v,i)=>[
                  String(i+1).padStart(3,"0"),
                  v.date,
                  v.time||"",
                  v.licensePlate||"",
                  v.customerName,
                  v.services.join("、"),
                  v.paymentMethod||"",
                  v.amount,
                ]);
                const totalRow=["","","","","","","合計",visits.reduce((s,v)=>s+v.amount,0)];
                const allRows=[headers,...rows,totalRow];
                const csvContent=allRows.map(function(row){return row.map(function(cell){return '"'+String(cell).split('"').join('""')+'"';}).join(",");}).join("\n");
                const bom="﻿";
                const blob=new Blob([bom+csvContent],{type:"text/csv;charset=utf-8;"});
                const url=URL.createObjectURL(blob);
                const a=document.createElement("a");
                a.href=url;
                a.download="工單報表_"+rangeLabel+"_"+new Date().toISOString().slice(0,10)+".csv";
                a.click();
                URL.revokeObjectURL(url);
              }}>
              📥 匯出報表
            </button>
          )}
        </div>
        {visits.length===0&&<div style={S.hint}>此區間無資料</div>}
        {visits.map((v,i)=>{
          const cust=customers.find(c=>c.id===v.customerId);
          return (
            <div key={v.id} style={S.orderCard} onClick={()=>cust&&onGoDetail(cust)}>
              <div style={S.orderTop}>
                <div style={S.orderNo}>#{String(i+1).padStart(3,"0")}</div>
                <div style={S.orderPlate}>{v.licensePlate||"—"}</div>
                <div style={S.orderDate}>{v.date} {v.time||""}</div>
                <div style={S.orderAmt}>${v.amount.toLocaleString()}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                <span style={S.orderName}>{v.customerName}</span>
                <span style={{fontSize:11,color:"rgba(255,255,255,0.25)",marginLeft:"auto"}}>點擊查看 ›</span>
              </div>
              <div style={S.visitServices}>
                {v.services.map(sv=><span key={sv} style={{...S.tagBlue,background:CAT_BG[classifyService(sv)],color:CAT_COLORS[classifyService(sv)]}}>{sv}</span>)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ── StaffLoginTab ─────────────────────────────────────────────
const DEFAULT_STAFF=[
  {id:1,name:"老闆",pin:"0000",role:"管理員",color:"#3498db"},
  {id:2,name:"師傅甲",pin:"1234",role:"技師",color:"#2ecc71"},
  {id:3,name:"師傅乙",pin:"5678",role:"技師",color:"#e67e22"},
];
function StaffLoginTab({S,darkMode,setDarkMode}){
  const [page,setPage]=useState("main");
  const [staff,setStaff]=useState(DEFAULT_STAFF);
  const [loggedIn,setLoggedIn]=useState(null);
  const [selStaff,setSelStaff]=useState(null);
  const [pin,setPin]=useState("");
  const [pinErr,setPinErr]=useState(false);
  const [newS,setNewS]=useState({name:"",pin:"",role:"技師"});
  const [showUpdate,setShowUpdate]=useState(false);
  const SLi={input:{width:"100%",boxSizing:"border-box",background:S.input.background,border:S.input.border,borderRadius:9,padding:"10px 13px",color:S.input.color,fontSize:15,outline:"none",fontFamily:"inherit"},
    addBtn:{width:"100%",padding:"11px",background:"linear-gradient(135deg,#3498db,#2980b9)",border:"none",color:"#fff",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer"},
    backBtn:{background:S.btnCancel.background,border:S.btnCancel.border,color:S.text,padding:"7px 14px",borderRadius:9,fontSize:13,cursor:"pointer"},
    numBtn:{padding:"16px 10px",background:S.btnCancel.background,border:S.btnCancel.border,borderRadius:12,color:S.text,fontSize:20,fontWeight:600,cursor:"pointer"},
    settingItem:{display:"flex",alignItems:"center",gap:14,background:S.card.background,border:S.card.border,borderRadius:14,padding:"16px",marginBottom:12,cursor:"pointer"},
  };
  const handlePin=(k)=>{
    if(k==="⌫"){setPin(p=>p.slice(0,-1));setPinErr(false);return;}
    const next=pin+k; setPin(next);
    if(next.length===4){
      if(next===selStaff.pin){setLoggedIn(selStaff);setPage("manage");setPin("");setPinErr(false);}
      else{setPinErr(true);setTimeout(()=>{setPin("");setPinErr(false);},800);}
    }
  };
  if(showUpdate) return (
    <div style={{padding:"24px 16px"}}>
      <button style={SLi.backBtn} onClick={()=>setShowUpdate(false)}>← 返回</button>
      <div style={{textAlign:"center",padding:"32px 0 20px"}}>
        <div style={{fontSize:48,marginBottom:12}}>🚀</div>
        <div style={{fontSize:20,fontWeight:700,color:S.text,marginBottom:8}}>AutoCare 版本資訊</div>
        <div style={{fontSize:13,color:S.sub,marginBottom:24}}>目前版本 v1.0.0</div>
        <div style={{background:"rgba(52,152,219,0.1)",border:"1px solid rgba(52,152,219,0.25)",borderRadius:14,padding:"16px",marginBottom:16}}>
          <div style={{fontSize:14,fontWeight:600,color:"#3498db",marginBottom:6}}>✅ 已是最新版本</div>
          <div style={{fontSize:12,color:S.sub}}>上次檢查：剛剛</div>
        </div>
      </div>
    </div>
  );
  if(page==="pin") return (
    <div style={{padding:"24px 16px"}}>
      <button style={SLi.backBtn} onClick={()=>{setPage("login");setSelStaff(null);setPin("");}}>← 返回</button>
      <div style={{textAlign:"center",marginTop:20,marginBottom:28}}>
        <div style={{width:72,height:72,borderRadius:20,background:selStaff.color+"33",border:`2px solid ${selStaff.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 12px"}}>👤</div>
        <div style={{fontSize:20,fontWeight:700,color:S.text}}>{selStaff.name}</div>
        <div style={{fontSize:13,color:S.sub,marginTop:4}}>請輸入 4 位數 PIN</div>
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:16,marginBottom:28}}>
        {[0,1,2,3].map(i=><div key={i} style={{width:18,height:18,borderRadius:"50%",background:pin.length>i?(pinErr?"#e74c3c":selStaff.color):"rgba(255,255,255,0.15)",transition:"background 0.2s"}}/>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,maxWidth:240,margin:"0 auto"}}>
        {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k,i)=>(
          <button key={i} style={{...SLi.numBtn,...(k===""?{visibility:"hidden"}:{}),background:pinErr?"rgba(231,76,60,0.15)":SLi.numBtn.background}} onClick={()=>k&&handlePin(k)}>{k}</button>
        ))}
      </div>
    </div>
  );
  if(page==="login") return (
    <div style={{padding:"20px 16px"}}>
      <button style={SLi.backBtn} onClick={()=>setPage("main")}>← 返回</button>
      <div style={{fontSize:18,fontWeight:700,color:S.text,margin:"16px 0 6px"}}>工作人員登入</div>
      <div style={{fontSize:13,color:S.sub,marginBottom:20}}>選擇人員後輸入 PIN 登入</div>
      {staff.map(s=>(
        <div key={s.id} style={{...SLi.settingItem}} onClick={()=>{setSelStaff(s);setPage("pin");}}>
          <div style={{width:44,height:44,borderRadius:12,background:s.color+"33",border:`2px solid ${s.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>👤</div>
          <div><div style={{fontSize:16,fontWeight:600,color:S.text}}>{s.name}</div>
          <div style={{fontSize:12,color:S.sub,marginTop:2}}>{s.role}</div></div>
          <div style={{marginLeft:"auto",fontSize:20,color:S.sub}}>›</div>
        </div>
      ))}
    </div>
  );
  if(page==="manage") return (
    <div style={{padding:"20px 16px"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
        <button style={SLi.backBtn} onClick={()=>{setPage("main");setLoggedIn(null);}}>← 登出</button>
        <div style={{flex:1,fontSize:15,fontWeight:700,color:S.text}}>管理人員</div>
        <div style={{fontSize:12,color:loggedIn ? loggedIn.color : undefined,fontWeight:600}}>{loggedIn ? loggedIn.name : ""}</div>
      </div>
      {staff.map(s=>(
        <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,background:S.card.background,border:S.card.border,borderRadius:11,padding:"11px 14px",marginBottom:8}}>
          <div style={{width:10,height:10,borderRadius:"50%",background:s.color}}/>
          <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:S.text}}>{s.name}</div>
          <div style={{fontSize:12,color:S.sub}}>{s.role} · PIN: {"•".repeat(4)}</div></div>
          {loggedIn && loggedIn.role==="管理員"&&s.id!==loggedIn.id&&(
            <button style={{background:"rgba(231,76,60,0.1)",border:"1px solid rgba(231,76,60,0.2)",color:"#e74c3c",borderRadius:7,padding:"4px 10px",fontSize:12,cursor:"pointer"}}
              onClick={()=>setStaff(staff.filter(x=>x.id!==s.id))}>移除</button>
          )}
        </div>
      ))}
      {loggedIn && loggedIn.role==="管理員"&&(
        <div style={{marginTop:14,background:S.card.background,border:S.card.border,borderRadius:12,padding:"14px"}}>
          <div style={{fontSize:13,color:S.sub,marginBottom:10}}>新增人員</div>
          <input style={SLi.input} placeholder="姓名" value={newS.name} onChange={e=>setNewS({...newS,name:e.target.value})}/>
          <input style={{...SLi.input,marginTop:8}} placeholder="4位數PIN" maxLength={4} value={newS.pin} onChange={e=>setNewS({...newS,pin:e.target.value.replace(/[^0-9]/g,"")})}/>
          <select style={{...SLi.input,marginTop:8}} value={newS.role} onChange={e=>setNewS({...newS,role:e.target.value})}>
            <option>技師</option><option>管理員</option><option>助理</option>
          </select>
          <button style={{...SLi.addBtn,marginTop:10}} onClick={()=>{
            if(!newS.name||newS.pin.length!==4) return;
            const colors=["#3498db","#2ecc71","#e67e22","#9b59b6","#e74c3c"];
            setStaff([...staff,{id:Date.now(),name:newS.name,pin:newS.pin,role:newS.role,color:colors[staff.length%colors.length]}]);
            setNewS({name:"",pin:"",role:"技師"});
          }}>新增</button>
        </div>
      )}
    </div>
  );
  return (
    <div style={{padding:"20px 16px"}}>
      <div style={{fontSize:18,fontWeight:700,color:S.text,marginBottom:20}}>⚙️ 設定</div>
      <div style={SLi.settingItem} onClick={()=>setShowUpdate(true)}>
        <div style={{fontSize:24,width:44,textAlign:"center"}}>🔄</div>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:600,color:S.text}}>檢查更新</div>
          <div style={{fontSize:12,color:S.sub,marginTop:2}}>目前版本 v1.0.0</div>
        </div>
        <div style={{fontSize:22,color:S.sub}}>›</div>
      </div>
      <div style={{...SLi.settingItem,cursor:"default"}}>
        <div style={{fontSize:24,width:44,textAlign:"center"}}>{darkMode?"🌙":"☀️"}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:600,color:S.text}}>{darkMode?"深色模式":"亮白模式"}</div>
          <div style={{fontSize:12,color:S.sub,marginTop:2}}>點擊切換介面主題</div>
        </div>
        <div onClick={()=>setDarkMode(d=>!d)} style={{width:52,height:28,borderRadius:14,cursor:"pointer",background:darkMode?"#3498db":"rgba(0,0,0,0.15)",position:"relative",transition:"background 0.3s",flexShrink:0}}>
          <div style={{position:"absolute",top:3,left:darkMode?26:3,width:22,height:22,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 4px rgba(0,0,0,0.3)",transition:"left 0.3s"}}/>
        </div>
      </div>
    </div>
  );
}


// ── Booking helpers ───────────────────────────────────────────
const WEEKDAYS_FULL=["週日","週一","週二","週三","週四","週五","週六"];
const HOURS=Array.from({length:16},(_,i)=>i+7);
function getServiceCatColor(services){
  if(services.some(s=>["全車鍍膜","客製鍍膜"].includes(s))) return "#3498db";
  if(services.some(s=>["大美容","小美容","車室深層"].includes(s))) return "#9b59b6";
  return "#2ecc71";
}
function getDIM(y,m){return new Date(y,m+1,0).getDate();}
function getFDOW(y,m){return new Date(y,m,1).getDay();}
function isoD(y,m,d){return y+"-"+String(m+1).padStart(2,"0")+"-"+String(d).padStart(2,"0");}
function getWeekDays(base){
  const d=new Date(base),dow=d.getDay();
  return Array.from({length:7},(_,i)=>{const x=new Date(d);x.setDate(x.getDate()-dow+i);return x.toISOString().slice(0,10);});
}

function BookingTab({S,bookings,setBookings,bookingView,setBookingView,bookingCalDate,setBookingCalDate,dailyLimit,setDailyLimit,showBookingForm,setShowBookingForm,showLimitModal,setShowLimitModal,bookingForm,setBookingForm,deleteBookingConfirm,setDeleteBookingConfirm,serviceCategories,bookingSelectedDate,setBookingSelectedDate}){
  const [menuOpen,setMenuOpen]=useState(false);
  const today=new Date().toISOString().slice(0,10);
  const year=bookingCalDate.getFullYear(),month=bookingCalDate.getMonth();
  const onDate=d=>bookings.filter(b=>b.date===d).sort((a,b)=>a.time.localeCompare(b.time));
  const isFull=d=>onDate(d).length>=dailyLimit;
  const openAddForm=(d,t)=>{setMenuOpen(false);setBookingForm({date:d||today,time:t||"09:00",name:"",phone:"",licensePlate:"",services:[],note:""});setShowBookingForm(true);};
  const saveBooking=()=>{
    if(!bookingForm.name.trim()){alert("請填寫姓名");return;}
    if(!bookingForm.id&&isFull(bookingForm.date)){alert("當日預約已滿");return;}
    if(bookingForm.id) setBookings(bookings.map(b=>b.id===bookingForm.id?{...bookingForm}:b));
    else setBookings([...bookings,{...bookingForm,id:Date.now()}]);
    setShowBookingForm(false);
  };
  const delBooking=id=>{setBookings(bookings.filter(b=>b.id!==id));setDeleteBookingConfirm(null);};
  const togBSvc=s=>setBookingForm(f=>({...f,services:f.services.includes(s)?f.services.filter(x=>x!==s):[...f.services,s]}));

  const BS={
    wrap:{paddingBottom:20},hint:{textAlign:"center",color:S.muted,padding:"28px 20px",fontSize:15},
    listHeader:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px 10px"},
    listTitle:{fontSize:18,fontWeight:700,color:S.text},
    menuBtn:{background:S.btnCancel.background,border:S.btnCancel.border,color:S.text,width:38,height:38,borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},
    menuOverlay:{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:300,display:"flex",justifyContent:"flex-end"},
    menuPanel:{width:220,background:S.modal.background,borderLeft:`1px solid ${S.card.border}`,padding:"24px 0",display:"flex",flexDirection:"column",gap:4},
    menuTitle:{fontSize:12,fontWeight:600,color:S.sub,padding:"0 20px 12px",borderBottom:`1px solid ${S.card.border}`,marginBottom:8},
    menuItem:{display:"flex",alignItems:"center",gap:12,padding:"13px 20px",background:"transparent",border:"none",color:S.text,fontSize:15,cursor:"pointer",textAlign:"left"},
    dateGroup:{fontSize:13,fontWeight:700,color:S.sub,padding:"12px 16px 6px",letterSpacing:0.5},
    apptCard:{display:"flex",gap:12,background:S.card.background,borderRadius:12,padding:"12px 14px",marginBottom:8,marginLeft:14,marginRight:14,border:`1px solid ${S.card.border}`},
    apptTime:{fontSize:17,fontWeight:800,color:"#3498db",minWidth:48,paddingTop:2},
    apptInfo:{flex:1,minWidth:0},apptName:{fontSize:17,fontWeight:600,color:S.text},
    apptMeta:{fontSize:13,color:S.sub,marginTop:2},apptNote:{fontSize:11,color:S.muted,marginTop:5},
    svcTag:{fontSize:12,padding:"2px 7px",borderRadius:6,fontWeight:600},
    editBtn:{background:"rgba(52,152,219,0.12)",border:"1px solid rgba(52,152,219,0.25)",color:"#3498db",borderRadius:8,width:32,height:32,fontSize:14,cursor:"pointer"},
    delBtn:{background:"rgba(231,76,60,0.08)",border:"1px solid rgba(231,76,60,0.2)",color:"#e74c3c",borderRadius:8,width:32,height:32,fontSize:14,cursor:"pointer"},
    calHeader:{padding:"12px 14px 6px"},calNav:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8},
    calTitle:{fontSize:18,fontWeight:700,color:S.text},
    navBtn:{background:S.btnCancel.background,border:"none",color:S.text,width:32,height:32,borderRadius:8,fontSize:18,cursor:"pointer"},
    weekLabels:{display:"grid",gridTemplateColumns:"repeat(7,1fr)",padding:"4px 14px"},
    weekLabel:{textAlign:"center",fontSize:11,color:S.muted,padding:"4px 0"},
    monthGrid:{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,padding:"0 14px 10px"},
    dayCell:{borderRadius:8,padding:"6px 2px 4px",textAlign:"center",cursor:"pointer",minHeight:46,display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:S.statCard.background,border:`1px solid ${S.card.border}`},
    dayCellToday:{border:"1px solid rgba(52,152,219,0.5)",background:"rgba(52,152,219,0.08)"},
    dayCellSel:{background:"rgba(52,152,219,0.25)",border:"1px solid #3498db"},
    dayCellNum:{fontSize:14,fontWeight:600},
    dayCellBadge:{fontSize:10,fontWeight:700,color:"#fff",borderRadius:10,minWidth:18,height:16,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px"},
    wkHeader:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px 8px"},
    backBtnSm:{background:S.btnCancel.background,border:S.btnCancel.border,color:S.text,padding:"7px 13px",borderRadius:9,fontSize:13,cursor:"pointer"},
    modalOverlay:{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20},
    modal:{background:S.modal.background,border:S.card.border,borderRadius:15,padding:"26px 22px",maxWidth:320,width:"100%",textAlign:"center"},
    modalTitle:{fontSize:17,fontWeight:700,color:S.text,marginBottom:7},
    modalText:{fontSize:13,color:S.sub,lineHeight:1.6,marginBottom:18},
    btnCancel:{flex:1,padding:"12px",background:S.btnCancel.background,border:S.btnCancel.border,color:S.sub,borderRadius:11,fontSize:14,cursor:"pointer"},
    btnDanger:{flex:1,padding:"10px",background:"#c0392b",border:"none",color:"#fff",borderRadius:9,fontSize:14,fontWeight:600,cursor:"pointer"},
    btnSave:{flex:2,padding:"12px",background:"linear-gradient(135deg,#3498db,#2980b9)",border:"none",color:"#fff",borderRadius:11,fontSize:14,fontWeight:700,cursor:"pointer"},
    limitAdjBtn:{width:44,height:44,borderRadius:12,background:S.btnCancel.background,border:S.btnCancel.border,color:S.text,fontSize:22,cursor:"pointer"},
    addApptBtn:{display:"block",width:"calc(100% - 28px)",margin:"12px 14px 0",padding:"13px",background:"linear-gradient(135deg,#3498db,#2980b9)",border:"none",color:"#fff",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer"},
    addApptBtnFull:{background:"rgba(231,76,60,0.15)",border:"1px solid rgba(231,76,60,0.3)",color:"#e74c3c",cursor:"not-allowed"},
    formWrap:{padding:"14px 16px"},formTitle:{fontSize:18,fontWeight:700,color:S.text,marginBottom:4},
    formTitle2:{fontSize:13,color:S.sub,marginBottom:16},
    input:{width:"100%",boxSizing:"border-box",background:S.input.background,border:S.input.border,borderRadius:9,padding:"10px 13px",color:S.input.color,fontSize:14,outline:"none",fontFamily:"inherit"},
    catLabel:{fontSize:11,fontWeight:600,color:S.muted,marginBottom:6,letterSpacing:0.5,textTransform:"uppercase"},
    serviceGrid:{display:"flex",flexWrap:"wrap",gap:7},
    serviceBtn:{padding:"8px 12px",borderRadius:9,background:S.btnCancel.background,border:S.btnCancel.border,color:S.sub,fontSize:13,cursor:"pointer"},
    serviceBtnActive:{background:"rgba(52,152,219,0.18)",border:"1px solid rgba(52,152,219,0.55)",color:"#3498db",fontWeight:600},
    formBtns:{display:"flex",gap:10,marginTop:20},
  };

  if(showBookingForm) return (
    <div style={BS.formWrap}>
      <div style={BS.formTitle}>{bookingForm.id?"編輯預約":"新增預約"}</div>
      <div style={BS.formTitle2}>{bookingForm.date}</div>
      <BField S={S} label="日期"><input style={BS.input} type="date" value={bookingForm.date} onChange={e=>setBookingForm({...bookingForm,date:e.target.value})}/></BField>
      <BField S={S} label="時間"><input style={BS.input} type="time" value={bookingForm.time} onChange={e=>setBookingForm({...bookingForm,time:e.target.value})}/></BField>
      <BField S={S} label="姓名 *"><input style={BS.input} value={bookingForm.name} onChange={e=>setBookingForm({...bookingForm,name:e.target.value})} placeholder="客戶姓名"/></BField>
      <BField S={S} label="電話"><input style={BS.input} value={bookingForm.phone||""} onChange={e=>setBookingForm({...bookingForm,phone:e.target.value})} placeholder="0912-345-678"/></BField>
      <BField S={S} label="車牌"><input style={BS.input} value={bookingForm.licensePlate} onChange={e=>setBookingForm({...bookingForm,licensePlate:e.target.value})} placeholder="ABC-1234"/></BField>
      <BField S={S} label="服務項目">
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {serviceCategories.map(cat=>(
            <div key={cat.label}>
              <div style={BS.catLabel}>{cat.label}</div>
              <div style={BS.serviceGrid}>
                {cat.items.map(sv=><button key={sv} style={{...BS.serviceBtn,...(bookingForm.services.includes(sv)?BS.serviceBtnActive:{})}} onClick={()=>togBSvc(sv)}>{sv}</button>)}
              </div>
            </div>
          ))}
        </div>
      </BField>
      <BField S={S} label="備註"><textarea style={{...BS.input,height:60,resize:"vertical"}} value={bookingForm.note} onChange={e=>setBookingForm({...bookingForm,note:e.target.value})}/></BField>
      <div style={BS.formBtns}>
        <button style={BS.btnCancel} onClick={()=>setShowBookingForm(false)}>取消</button>
        <button style={BS.btnSave} onClick={saveBooking}>{bookingForm.id?"儲存":"新增預約"}</button>
      </div>
    </div>
  );

  if(bookingView==="week"){
    const weekDays=getWeekDays(bookingCalDate);
    return (
      <div style={{paddingBottom:20}}>
        <div style={BS.wkHeader}>
          <button style={BS.backBtnSm} onClick={()=>setBookingView("list")}>← 返回</button>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button style={BS.navBtn} onClick={()=>{const d=new Date(bookingCalDate);d.setDate(d.getDate()-7);setBookingCalDate(d);}}>‹</button>
            <div style={{fontSize:13,fontWeight:600,color:S.sub}}>{weekDays[0].slice(5)} ~ {weekDays[6].slice(5)}</div>
            <button style={BS.navBtn} onClick={()=>{const d=new Date(bookingCalDate);d.setDate(d.getDate()+7);setBookingCalDate(d);}}>›</button>
          </div>
        </div>
        <div style={{overflowX:"auto",overflowY:"auto",maxHeight:"calc(100vh - 160px)"}}>
          <div style={{minWidth:560}}>
            <div style={{display:"grid",gridTemplateColumns:"44px repeat(7,1fr)",borderBottom:`1px solid ${S.card.border}`}}>
              <div/>
              {weekDays.map(d=>{
                const wd=new Date(d).getDay(),isT=d===today;
                return <div key={d} style={{textAlign:"center",padding:"6px 2px 4px",borderLeft:`1px solid ${S.card.border}`}}>
                  <div style={{fontSize:13,color:isT?"#3498db":S.sub}}>{WEEKDAYS_FULL[wd]}</div>
                  <div style={{fontSize:16,fontWeight:700,color:isT?"#3498db":S.text}}>{parseInt(d.slice(8))}</div>
                  <div style={{display:"flex",gap:2,justifyContent:"center",marginTop:3}}>
                    {["#2ecc71","#9b59b6","#3498db"].map((c,ci)=><div key={ci} style={{fontSize:11,padding:"1px 4px",borderRadius:3,background:c+"33",color:c,fontWeight:600}}>{["洗車","美容","鍍膜"][ci]}</div>)}
                  </div>
                </div>;
              })}
            </div>
            {HOURS.map(hr=>(
              <div key={hr} style={{display:"grid",gridTemplateColumns:"44px repeat(7,1fr)",borderBottom:`1px solid ${S.card.border}22`,minHeight:40}}>
                <div style={{fontSize:12,color:S.sub,textAlign:"right",paddingRight:6,paddingTop:4}}>{String(hr).padStart(2,"0")}:00</div>
                {weekDays.map(d=>{
                  const appts=onDate(d).filter(bk=>parseInt(bk.time.split(":")[0])===hr);
                  const tStr=String(hr).padStart(2,"0")+":00";
                  return <div key={d} style={{borderLeft:`1px solid ${S.card.border}22`,padding:"2px",minHeight:40,cursor:"pointer"}}
                    onClick={()=>{if(appts.length===0) openAddForm(d,tStr);}}>
                    {appts.map(bk=>{
                      const c=getServiceCatColor(bk.services);
                      return <div key={bk.id} style={{background:c+"33",border:`1px solid ${c}66`,borderRadius:4,padding:"2px 3px",cursor:"pointer",height:"100%",boxSizing:"border-box"}}
                        onClick={e=>{e.stopPropagation();setBookingForm({...bk});setShowBookingForm(true);}}>
                        <div style={{fontSize:12,fontWeight:700,color:c,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{bk.name}</div>
                        <div style={{fontSize:11,color:S.sub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{bk.licensePlate}</div>
                      </div>;
                    })}
                  </div>;
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if(bookingView==="calendar"){
    const totalD=getDIM(year,month),firstD=getFDOW(year,month);
    return (
      <div style={BS.wrap}>
        <div style={BS.calHeader}>
          <div style={BS.calNav}>
            <button style={BS.backBtnSm} onClick={()=>setBookingView("list")}>← 返回</button>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <button style={BS.navBtn} onClick={()=>{const d=new Date(bookingCalDate);d.setMonth(d.getMonth()-1);setBookingCalDate(d);}}>‹</button>
              <div style={BS.calTitle}>{year}年{month+1}月</div>
              <button style={BS.navBtn} onClick={()=>{const d=new Date(bookingCalDate);d.setMonth(d.getMonth()+1);setBookingCalDate(d);}}>›</button>
            </div>
          </div>
        </div>
        <div style={BS.weekLabels}>{["日","一","二","三","四","五","六"].map(w=><div key={w} style={BS.weekLabel}>{w}</div>)}</div>
        <div style={BS.monthGrid}>
          {Array.from({length:firstD}).map((_,i)=><div key={`e${i}`}/>)}
          {Array.from({length:totalD}).map((_,i)=>{
            const d=isoD(year,month,i+1),cnt=onDate(d).length,isT=d===today,isSel=d===bookingSelectedDate,full=cnt>=dailyLimit;
            return <div key={d} style={{...BS.dayCell,...(isT?BS.dayCellToday:{}),...(isSel?BS.dayCellSel:{})}}
              onClick={()=>{if(cnt===0) openAddForm(d);else{setBookingSelectedDate(d);setBookingView("list");}}}>
              <div style={{...BS.dayCellNum,color:isT?"#3498db":isSel?"#fff":S.text}}>{i+1}</div>
              {cnt>0&&<div style={{...BS.dayCellBadge,background:full?"#e74c3c":"#3498db"}}>{cnt}</div>}
            </div>;
          })}
        </div>
        {showLimitModal&&(
          <div style={BS.modalOverlay}><div style={BS.modal}>
            <div style={BS.modalTitle}>每日預約上限</div>
            <div style={{display:"flex",alignItems:"center",gap:16,margin:"16px 0"}}>
              <button style={BS.limitAdjBtn} onClick={()=>setDailyLimit(Math.max(1,dailyLimit-1))}>−</button>
              <div style={{fontSize:32,fontWeight:800,color:S.text,minWidth:40,textAlign:"center"}}>{dailyLimit}</div>
              <button style={BS.limitAdjBtn} onClick={()=>setDailyLimit(dailyLimit+1)}>+</button>
            </div>
            <div style={BS.modalText}>每天最多接受 {dailyLimit} 筆預約</div>
            <button style={BS.btnSave} onClick={()=>setShowLimitModal(false)}>確定</button>
          </div></div>
        )}
      </div>
    );
  }

  // List view
  const allSorted=[...bookings].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  const grouped={};
  allSorted.forEach(bk=>{if(!grouped[bk.date])grouped[bk.date]=[];grouped[bk.date].push(bk);});
  return (
    <div style={BS.wrap}>
      {menuOpen&&(
        <div style={BS.menuOverlay} onClick={()=>setMenuOpen(false)}>
          <div style={BS.menuPanel} onClick={e=>e.stopPropagation()}>
            <div style={BS.menuTitle}>選單</div>
            <button style={BS.menuItem} onClick={()=>openAddForm(today)}>＋ 新增預約</button>
            <button style={BS.menuItem} onClick={()=>{setMenuOpen(false);setBookingView("calendar");}}>📅 月曆</button>
            <button style={BS.menuItem} onClick={()=>{setMenuOpen(false);setBookingView("week");}}>📊 一週表</button>
            <button style={BS.menuItem} onClick={()=>{setMenuOpen(false);setShowLimitModal(true);}}>⚙️ 每日上限（{dailyLimit}筆）</button>
          </div>
        </div>
      )}
      <div style={BS.listHeader}>
        <div style={BS.listTitle}>預約列表</div>
        <button style={BS.menuBtn} onClick={()=>setMenuOpen(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>
      {allSorted.length===0&&<div style={BS.hint}>尚無預約，點右上角新增</div>}
      {Object.keys(grouped).sort().map(date=>(
        <div key={date}>
          <div style={BS.dateGroup}>{date}</div>
          {grouped[date].map(bk=>{
            const color=getServiceCatColor(bk.services);
            return <div key={bk.id} style={{...BS.apptCard,borderLeft:`3px solid ${color}`}}>
              <div style={BS.apptTime}>{bk.time}</div>
              <div style={BS.apptInfo}>
                <div style={BS.apptName}>{bk.name}</div>
                <div style={BS.apptMeta}>{bk.phone&&<span>{bk.phone}</span>}{bk.phone&&bk.licensePlate&&<span style={{color:S.sub}}> · </span>}{bk.licensePlate&&<span style={{color:"#3498db",fontWeight:600}}>{bk.licensePlate}</span>}</div>
                {bk.services.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:5}}>{bk.services.map(sv=><span key={sv} style={{...BS.svcTag,color,background:color+"22"}}>{sv}</span>)}</div>}
                {bk.note&&<div style={BS.apptNote}>📝 {bk.note}</div>}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
                <button style={BS.editBtn} onClick={()=>{setBookingForm({...bk});setShowBookingForm(true);}}>✏️</button>
                <button style={BS.delBtn} onClick={()=>setDeleteBookingConfirm(bk)}>🗑️</button>
              </div>
            </div>;
          })}
        </div>
      ))}
      {deleteBookingConfirm&&(
        <div style={BS.modalOverlay}><div style={BS.modal}>
          <div style={{fontSize:32,marginBottom:10}}>⚠️</div>
          <div style={BS.modalTitle}>確認刪除</div>
          <div style={BS.modalText}>刪除 {deleteBookingConfirm.name} 的 {deleteBookingConfirm.date} {deleteBookingConfirm.time} 預約？</div>
          <div style={{display:"flex",gap:10}}>
            <button style={BS.btnCancel} onClick={()=>setDeleteBookingConfirm(null)}>取消</button>
            <button style={BS.btnDanger} onClick={()=>delBooking(deleteBookingConfirm.id)}>刪除</button>
          </div>
        </div></div>
      )}
      {showLimitModal&&(
        <div style={BS.modalOverlay}><div style={BS.modal}>
          <div style={BS.modalTitle}>每日預約上限</div>
          <div style={{display:"flex",alignItems:"center",gap:16,margin:"16px 0"}}>
            <button style={BS.limitAdjBtn} onClick={()=>setDailyLimit(Math.max(1,dailyLimit-1))}>−</button>
            <div style={{fontSize:32,fontWeight:800,color:S.text,minWidth:40,textAlign:"center"}}>{dailyLimit}</div>
            <button style={BS.limitAdjBtn} onClick={()=>setDailyLimit(dailyLimit+1)}>+</button>
          </div>
          <div style={BS.modalText}>每天最多接受 {dailyLimit} 筆預約</div>
          <button style={BS.btnSave} onClick={()=>setShowLimitModal(false)}>確定</button>
        </div></div>
      )}
    </div>
  );
}

function BField({S,label,children}){
  return <div style={S.formField}><label style={S.formLabel}>{label}</label>{children}</div>;
}
function Field({S,label,children}){
  return <div style={S.formField}><label style={S.formLabel}>{label}</label>{children}</div>;
}


// ── Main App ──────────────────────────────────────────────────
export default function App(){
  const [darkMode,setDarkMode]=useState(true);
  const S=useMemo(()=>makeS(darkMode),[darkMode]);
  const [customers,setCustomers]=useState(()=>{
    try {
      const saved = localStorage.getItem("mp_customers");
      return saved ? JSON.parse(saved) : initialCustomers;
    } catch(e) { return initialCustomers; }
  });

  // Load from Supabase on mount + poll every 15 seconds
  useEffect(()=>{
    const load = () => {
      sbGet().then(data=>{
        if (data && data.length > 0) {
          setCustomers(data);
          try { localStorage.setItem("mp_customers", JSON.stringify(data)); } catch(e){}
        }
      });
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  },[]);

  // Save to localStorage backup
  useEffect(()=>{
    try { localStorage.setItem("mp_customers", JSON.stringify(customers)); } catch(e){}
  },[customers]);

  function saveToCloud(c) {
    sbUpsert({ cid: String(c.id), data: JSON.stringify(c) });
  }
  function deleteFromCloud(id) {
    sbDelete(String(id));
  }
  const [view,setView]=useState("list");
  const [tab,setTab]=useState("home");
  const [homeView,setHomeView]=useState("main");
  const [selected,setSelected]=useState(null);
  const [editingVisit,setEditingVisit]=useState(null);
  const [customerForm,setCustomerForm]=useState(emptyCustomerForm);
  const [visitForm,setVisitForm]=useState(makeEmptyVisitForm());
  const [search,setSearch]=useState("");
  const [toast,setToast]=useState(null);
  const [deleteConfirm,setDeleteConfirm]=useState(null);
  const [statsRange,setStatsRange]=useState("week");
  const [bookings,setBookings]=useState([
    {id:1,date:"2026-04-05",time:"09:00",name:"陳大明",phone:"0912-345-678",licensePlate:"ABC-1234",services:["大美容"],note:""},
    {id:2,date:"2026-04-05",time:"14:00",name:"林小美",phone:"0923-456-789",licensePlate:"XYZ-5678",services:["全車鍍膜"],note:"新車"},
    {id:3,date:"2026-04-07",time:"10:30",name:"王建國",phone:"0934-567-890",licensePlate:"DEF-9012",services:["精緻深層"],note:""},
  ]);
  const [bookingView,setBookingView]=useState("list");
  const [bookingSelectedDate,setBookingSelectedDate]=useState(new Date().toISOString().slice(0,10));
  const [bookingCalDate,setBookingCalDate]=useState(new Date());
  const [dailyLimit,setDailyLimit]=useState(8);
  const [showBookingForm,setShowBookingForm]=useState(false);
  const [showLimitModal,setShowLimitModal]=useState(false);
  const [bookingForm,setBookingForm]=useState({date:"",time:"09:00",name:"",phone:"",licensePlate:"",services:[],note:""});
  const [deleteBookingConfirm,setDeleteBookingConfirm]=useState(null);

  const showToast=(msg,type="success")=>{setToast({msg,type});setTimeout(()=>setToast(null),2500);};
  const thisMonth=new Date().toISOString().slice(0,7);
  const totalCustomers=customers.length;
  const thisMonthVisits=customers.reduce((s,c)=>s+c.visits.filter(v=>v.date.startsWith(thisMonth)).length,0);
  const showList=search.trim().length>0;
  const filtered=showList?customers.filter(c=>{
    const q=search.trim().toLowerCase().replace(/-/g,"");
    return c.name.includes(search.trim())||c.phone.replace(/-/g,"").includes(q)||(c.licensePlate||"").replace(/-/g,"").toLowerCase().includes(q)||(c.vehicles||[]).some(v=>(v.licensePlate||"").replace(/-/g,"").toLowerCase().includes(q));
  }):[];

  const goList=()=>{setView("list");setSelected(null);};
  const goDetail=c=>{setSelected(c);setView("detail");};
  const openEditCustomer=c=>{setCustomerForm({name:c.name,phone:c.phone,carBrand:c.carBrand||"",carModel:c.carModel||"",licensePlate:c.licensePlate||"",note:c.note||"",vehicles:c.vehicles?[...c.vehicles.map(v=>({...v}))]:[]}); setView("editCustomer");};
  const saveCustomer=()=>{
    if(!customerForm.name.trim()||!customerForm.phone.trim()){showToast("姓名與電話為必填","error");return;}
    const now=new Date().toISOString();
    if(view==="addCustomer"){
      const fullModel=[customerForm.carBrand,customerForm.carModel].filter(Boolean).join(" ");
      const newC={...customerForm,carModel:fullModel,id:String(Date.now()),updatedAt:now,visits:[],vehicles:customerForm.vehicles||[]};
      setCustomers([newC,...customers]);
      saveToCloud(newC);
      showToast("客戶已新增 ✓");setView("list");
    } else {
      const updated=customers.map(c=>c.id===selected.id?{...c,...customerForm,vehicles:customerForm.vehicles||c.vehicles||[],updatedAt:now}:c);
      setCustomers(updated);
      const updatedC=updated.find(c=>c.id===selected.id);
      saveToCloud(updatedC);
      setSelected(updatedC);showToast("資料已更新 ✓");setView("detail");
    }
  };
  const deleteCustomer=id=>{
    setCustomers(customers.filter(c=>c.id!==id));
    deleteFromCloud(id);
    setDeleteConfirm(null);goList();showToast("客戶已刪除","error");
  };
  const openAddVisit=()=>{setVisitForm(makeEmptyVisitForm());setView("addVisit");};
  const openEditVisit=v=>{setVisitForm({date:v.date,time:v.time||"",services:[...v.services],paymentMethod:v.paymentMethod,amount:String(v.amount),note:v.note,visitLicensePlate:v.visitLicensePlate||"",staff:v.staff||""});setEditingVisit(v);setView("editVisit");};
  const saveVisit=()=>{
    if(visitForm.services.length===0){showToast("請選擇至少一項服務","error");return;}
    const now=new Date().toISOString();
    let updated;
    if(view==="addVisit"){
      const nv={...visitForm,id:String(Date.now()),amount:Number(visitForm.amount)||0};
      updated=customers.map(c=>c.id===selected.id?{...c,updatedAt:now,visits:[nv,...c.visits].sort((a,b)=>b.date.localeCompare(a.date))}:c);
      saveToCloud(updated.find(c=>c.id===selected.id));
      showToast("消費紀錄已新增 ✓");
    } else {
      updated=customers.map(c=>c.id===selected.id?{...c,updatedAt:now,visits:c.visits.map(v=>v.id===editingVisit.id?{...v,...visitForm,amount:Number(visitForm.amount)||0}:v)}:c);
      saveToCloud(updated.find(c=>c.id===selected.id));
      showToast("紀錄已更新 ✓");
    }
    setCustomers(updated);setSelected(updated.find(c=>c.id===selected.id));setView("detail");
  };
  const deleteVisit=vid=>{
    const now=new Date().toISOString();
    const updated=customers.map(c=>c.id===selected.id?{...c,updatedAt:now,visits:c.visits.filter(v=>v.id!==vid)}:c);
    setCustomers(updated);
    setSelected(savedC3);setDeleteConfirm(null);showToast("紀錄已刪除","error");
  };
  const toggleService=s=>setVisitForm(f=>({...f,services:f.services.includes(s)?f.services.filter(x=>x!==s):[...f.services,s]}));
  const handleBack=()=>{
    if(view==="detail") {setView("list");setSelected(null);}
    else if(["editCustomer","addVisit","editVisit"].includes(view)) setView("detail");
    else if(view==="addCustomer") setView("list");
  };
  const currentSelected=selected?customers.find(c=>c.id===selected.id)||selected:null;

  return (
    <div style={S.root}>
      <div style={S.bgD1}/><div style={S.bgD2}/>
      {toast&&<div style={{...S.toast,background:toast.type==="error"?"#c0392b":"#1e8449"}}>{toast.msg}</div>}
      {deleteConfirm&&(
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={{fontSize:34,marginBottom:10}}>⚠️</div>
            <div style={S.modalTitle}>確認刪除</div>
            <div style={S.modalText}>{deleteConfirm.msg}</div>
            <div style={S.modalBtns}>
              <button style={S.btnCancel} onClick={()=>setDeleteConfirm(null)}>取消</button>
              <button style={S.btnDanger} onClick={()=>{if(deleteConfirm.type==="customer")deleteCustomer(deleteConfirm.id);else deleteVisit(deleteConfirm.id);}}>刪除</button>
            </div>
          </div>
        </div>
      )}
      <div style={S.container}>
        {/* Header */}
        <div style={S.header}>
          <div style={S.headerL}>
            {view!=="list"&&<button style={S.backBtn} onClick={handleBack}>←</button>}
            <div style={S.subtitle}>客戶管理系統</div>
          </div>
          <div style={S.headerR}>
            {view==="detail"&&currentSelected&&(<>
              <button style={S.outlineBtn} onClick={()=>openEditCustomer(currentSelected)}>✏️ 編輯</button>
              <button style={S.addBtn} onClick={openAddVisit}>+ 新增消費</button>
            </>)}
          </div>
        </div>

        {/* HOME */}
        {tab==="home"&&view==="list"&&homeView==="main"&&(
          <HomeMain S={S} customers={customers} totalCustomers={totalCustomers} thisMonthVisits={thisMonthVisits}
            onOpenAnalytics={()=>setHomeView("analytics")} onGoDetail={goDetail} formatUpdated={formatUpdated}/>
        )}
        {tab==="home"&&view==="list"&&homeView==="analytics"&&(
          <HomeAnalytics S={S} customers={customers} statsRange={statsRange} setStatsRange={setStatsRange}
            onBack={()=>setHomeView("main")} onGoDetail={c=>{setHomeView("main");goDetail(c);}}/>
        )}

        {/* ADD CUSTOMER TAB */}
        {tab==="add"&&view==="list"&&(
          <div style={S.formWrap}>
            <div style={S.formTitle}>新增客戶</div>
            <Field S={S} label="姓名 *"><input style={S.input} value={customerForm.name} onChange={e=>setCustomerForm({...customerForm,name:e.target.value})} placeholder="客戶姓名"/></Field>
            <Field S={S} label="電話 *"><input style={S.input} value={customerForm.phone} onChange={e=>setCustomerForm({...customerForm,phone:e.target.value})} placeholder="0912-345-678"/></Field>
            <Field S={S} label="廠牌">
              <select style={S.selectInput} value={customerForm.carBrand} onChange={e=>setCustomerForm({...customerForm,carBrand:e.target.value,carModel:""})}>
                <option value="">請選擇廠牌</option>
                {Object.keys(CAR_BRANDS).map(b=><option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
            {customerForm.carBrand&&<Field S={S} label="型號">
              <select style={S.selectInput} value={customerForm.carModel} onChange={e=>setCustomerForm({...customerForm,carModel:e.target.value})}>
                <option value="">請選擇型號</option>
                {CAR_BRANDS[customerForm.carBrand].map(m=><option key={m} value={m}>{m}</option>)}
              </select>
            </Field>}
            <Field S={S} label="車牌"><input style={S.input} value={customerForm.licensePlate} onChange={e=>setCustomerForm({...customerForm,licensePlate:e.target.value})} placeholder="ABC-1234"/></Field>
            <Field S={S} label="備註"><textarea style={{...S.input,height:72,resize:"vertical"}} value={customerForm.note} onChange={e=>setCustomerForm({...customerForm,note:e.target.value})} placeholder="特殊需求..."/></Field>
            <div style={S.formBtns}>
              <button style={S.btnCancel} onClick={()=>{setCustomerForm(emptyCustomerForm);setTab("home");}}>取消</button>
              <button style={S.btnSave} onClick={()=>{
                if(!customerForm.name.trim()||!customerForm.phone.trim()){showToast("姓名與電話為必填","error");return;}
                const now=new Date().toISOString();
                const fm=[customerForm.carBrand,customerForm.carModel].filter(Boolean).join(" ");
                const veh=customerForm.carBrand&&customerForm.licensePlate?[{brand:customerForm.carBrand,model:customerForm.carModel,licensePlate:customerForm.licensePlate}]:[];
                const nc={...customerForm,carModel:fm,id:String(Date.now()),updatedAt:now,visits:[],vehicles:veh};
                setCustomers([nc,...customers]);
                saveToCloud(nc);
                setCustomerForm(emptyCustomerForm);showToast("客戶已新增 ✓");setTab("home");
              }}>新增客戶</button>
            </div>
          </div>
        )}

        {/* SEARCH TAB */}
        {tab==="search"&&view==="list"&&(
          <div>
            <div style={S.searchWrap}>
              <input style={S.searchInput} placeholder="🔍 姓名、電話或車牌..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            {!showList&&<div style={S.hint}>輸入姓名或電話或車牌開始搜尋</div>}
            {showList&&filtered.length===0&&<div style={S.hint}>找不到符合的客戶</div>}
            {showList&&filtered.length>0&&(
              <div style={S.cardList}>
                {filtered.map(c=>{
                  const totalSpent=c.visits.reduce((s,v)=>s+v.amount,0);
                  return <div key={c.id} style={S.card} onClick={()=>goDetail(c)}>
                    <div style={S.cardAvatar}>{c.name[0]}</div>
                    <div style={S.cardInfo}>
                      <div style={S.cardName}>{c.name}</div>
                      <div style={S.cardSub}>{c.phone} · {c.carModel||"未填車型"}</div>
                      <div style={S.cardTags}>
                        {c.visits.length>0&&<span style={S.tagBlue}>{c.visits[0].services[0]}</span>}
                        <span style={S.tagGray}>共{c.visits.length}次</span>
                      </div>
                    </div>
                    <div style={S.cardRight}>
                      <div style={S.cardAmount}>${totalSpent.toLocaleString()}</div>
                      <div style={S.cardDateLabel}>最後編輯</div>
                      <div style={S.cardDate}>{formatUpdated(c.updatedAt)}</div>
                    </div>
                  </div>;
                })}
              </div>
            )}
          </div>
        )}

        {/* BOOKING TAB */}
        {tab==="booking"&&view==="list"&&(
          <BookingTab S={S} bookings={bookings} setBookings={setBookings}
            bookingView={bookingView} setBookingView={setBookingView}
            bookingSelectedDate={bookingSelectedDate} setBookingSelectedDate={setBookingSelectedDate}
            bookingCalDate={bookingCalDate} setBookingCalDate={setBookingCalDate}
            dailyLimit={dailyLimit} setDailyLimit={setDailyLimit}
            showBookingForm={showBookingForm} setShowBookingForm={setShowBookingForm}
            showLimitModal={showLimitModal} setShowLimitModal={setShowLimitModal}
            bookingForm={bookingForm} setBookingForm={setBookingForm}
            deleteBookingConfirm={deleteBookingConfirm} setDeleteBookingConfirm={setDeleteBookingConfirm}
            serviceCategories={serviceCategories}/>
        )}

        {/* SETTINGS TAB */}
        {tab==="settings"&&view==="list"&&(
          <StaffLoginTab S={S} darkMode={darkMode} setDarkMode={setDarkMode}/>
        )}

        {/* DETAIL VIEW */}
        {view==="detail"&&currentSelected&&(
          <div style={S.detail}>
            <div style={S.detailHero}>
              <div style={S.detailAvatar}>{currentSelected.name[0]}</div>
              <div style={S.detailName}>{currentSelected.name}</div>
              <div style={S.detailPhone}>{currentSelected.phone}</div>
              <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:10,flexWrap:"wrap"}}>
                {(currentSelected.vehicles&&currentSelected.vehicles.length>0)
                  ?currentSelected.vehicles.map((v,i)=><span key={i} style={S.badge}>{[(v.brand ? v.brand.split(" ")[0] : ""),v.model].filter(Boolean).join(" ")}{v.licensePlate?` · ${v.licensePlate}`:""}</span>)
                  :<>{currentSelected.carModel&&<span style={S.badge}>{currentSelected.carModel}</span>}{currentSelected.licensePlate&&<span style={S.badgeGray}>{currentSelected.licensePlate}</span>}</>
                }
              </div>
              {currentSelected.note&&<div style={S.detailNote}>📝 {currentSelected.note}</div>}
            </div>
            <div style={S.summaryRow}>
              <div style={S.summaryItem}><div style={S.summaryValue}>{currentSelected.visits.length}次</div><div style={S.summaryLabel}>消費次數</div></div>
              <div style={{...S.summaryItem,borderRight:"none"}}><div style={{...S.summaryValue,color:"#2ecc71"}}>${currentSelected.visits.reduce((s,v)=>s+v.amount,0).toLocaleString()}</div><div style={S.summaryLabel}>總消費</div></div>
              <div style={{...S.summaryItem,borderRight:"none"}}><div style={S.summaryValue}>{currentSelected.visits.length>0?currentSelected.visits[0].date:"—"}</div><div style={S.summaryLabel}>最後到訪</div></div>
            </div>
            <div style={S.sectionTitle}>📋 消費紀錄</div>
            {currentSelected.visits.length===0&&<div style={S.hint}>尚無消費紀錄</div>}
            {currentSelected.visits.map(v=>(
              <div key={v.id} style={S.visitCard}>
                <div style={S.visitTop}>
                  <div style={{flex:1}}>
                    <div style={S.visitDate}>📅 {v.date}{v.time?" "+v.time:""}</div>
                    {v.visitLicensePlate&&<div style={{fontSize:12,color:"#3498db",fontWeight:600,marginTop:2}}>🚗 {v.visitLicensePlate}</div>}
                  </div>
                  <div style={S.visitAmount}>${v.amount.toLocaleString()}</div>
                </div>
                <div style={S.visitServices}>{v.services.map(sv=><span key={sv} style={S.tagBlue}>{sv}</span>)}<span style={S.tagPayment}>{v.paymentMethod}</span></div>
                {v.staff&&<div style={{fontSize:12,color:S.sub,marginTop:2}}>👤 {v.staff}</div>}
                {v.note&&<div style={S.visitNote}>📝 {v.note}</div>}
                <div style={S.visitActions}>
                  <button style={S.visitEditBtn} onClick={()=>openEditVisit(v)}>編輯</button>
                  <button style={S.visitDeleteBtn} onClick={()=>setDeleteConfirm({type:"visit",id:v.id,msg:"確定刪除 "+v.date+" 的消費紀錄嗎？"})}>刪除</button>
                </div>
              </div>
            ))}
            <button style={S.deleteBtnFull} onClick={()=>setDeleteConfirm({type:"customer",id:currentSelected.id,msg:"確定刪除「"+currentSelected.name+"」的所有資料嗎？"})}>🗑️ 刪除此客戶</button>
          </div>
        )}

        {/* ADD/EDIT CUSTOMER */}
        {(view==="addCustomer"||view==="editCustomer")&&(
          <div style={S.formWrap}>
            <div style={S.formTitle}>{view==="addCustomer"?"新增客戶":"編輯客戶資料"}</div>
            <Field S={S} label="姓名 *"><input style={S.input} value={customerForm.name} onChange={e=>setCustomerForm({...customerForm,name:e.target.value})} placeholder="客戶姓名"/></Field>
            <Field S={S} label="電話 *"><input style={S.input} value={customerForm.phone} onChange={e=>setCustomerForm({...customerForm,phone:e.target.value})} placeholder="0912-345-678"/></Field>
            <Field S={S} label="廠牌">
              <select style={S.selectInput} value={customerForm.carBrand||""} onChange={e=>setCustomerForm({...customerForm,carBrand:e.target.value,carModel:""})}>
                <option value="">請選擇廠牌</option>
                {Object.keys(CAR_BRANDS).map(b=><option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
            {customerForm.carBrand&&<Field S={S} label="型號">
              <select style={S.selectInput} value={customerForm.carModel||""} onChange={e=>setCustomerForm({...customerForm,carModel:e.target.value})}>
                <option value="">請選擇型號</option>
                {(CAR_BRANDS[customerForm.carBrand]||[]).map(m=><option key={m} value={m}>{m}</option>)}
              </select>
            </Field>}
            <Field S={S} label="車牌"><input style={S.input} value={customerForm.licensePlate||""} onChange={e=>setCustomerForm({...customerForm,licensePlate:e.target.value})} placeholder="ABC-1234"/></Field>
            <Field S={S} label="備註"><textarea style={{...S.input,height:72,resize:"vertical"}} value={customerForm.note||""} onChange={e=>setCustomerForm({...customerForm,note:e.target.value})} placeholder="特殊需求..."/></Field>
            {view==="editCustomer"&&(
              <div style={{marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <div style={S.formLabel}>🚗 車輛管理</div>
                  <button style={{...S.visitEditBtn,fontSize:12,padding:"5px 12px"}} onClick={()=>setCustomerForm(f=>({...f,vehicles:[...(f.vehicles||[]),{brand:"",model:"",licensePlate:""}]}))}>+ 新增車輛</button>
                </div>
                {(customerForm.vehicles||[]).map((v,idx)=>(
                  <div key={idx} style={{background:S.statCard.background,border:S.card.border,borderRadius:10,padding:"10px",marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <span style={{fontSize:12,color:S.sub}}>車輛 {idx+1}</span>
                      <button style={{background:"rgba(231,76,60,0.1)",border:"1px solid rgba(231,76,60,0.2)",color:"#e74c3c",borderRadius:6,padding:"3px 10px",fontSize:12,cursor:"pointer"}}
                        onClick={()=>setCustomerForm(f=>({...f,vehicles:f.vehicles.filter((_,i)=>i!==idx)}))}>移除</button>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                      <select style={{...S.selectInput,fontSize:13}} value={v.brand} onChange={e=>setCustomerForm(f=>({...f,vehicles:f.vehicles.map((vv,i)=>i===idx?{...vv,brand:e.target.value,model:""}:vv)}))}>
                        <option value="">選廠牌</option>{Object.keys(CAR_BRANDS).map(b=><option key={b} value={b}>{b}</option>)}
                      </select>
                      <select style={{...S.selectInput,fontSize:13}} value={v.model} onChange={e=>setCustomerForm(f=>({...f,vehicles:f.vehicles.map((vv,i)=>i===idx?{...vv,model:e.target.value}:vv)}))}>
                        <option value="">選型號</option>{v.brand&&(CAR_BRANDS[v.brand]||[]).map(m=><option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <input style={{...S.input,fontSize:13}} value={v.licensePlate} placeholder="車牌 ABC-1234" onChange={e=>setCustomerForm(f=>({...f,vehicles:f.vehicles.map((vv,i)=>i===idx?{...vv,licensePlate:e.target.value}:vv)}))}/>
                  </div>
                ))}
              </div>
            )}
            <div style={S.formBtns}>
              <button style={S.btnCancel} onClick={handleBack}>取消</button>
              <button style={S.btnSave} onClick={saveCustomer}>{view==="addCustomer"?"新增客戶":"儲存變更"}</button>
            </div>
          </div>
        )}

        {/* ADD/EDIT VISIT */}
        {(view==="addVisit"||view==="editVisit")&&(
          <div style={S.formWrap}>
            <div style={S.formTitle}>{view==="addVisit"?"新增消費紀錄":"編輯消費紀錄"}</div>
            <Field S={S} label="消費日期"><TWDatePicker S={S} value={visitForm.date} onChange={d=>setVisitForm({...visitForm,date:d})}/></Field>
            <Field S={S} label="時間"><input style={{...S.input,maxWidth:"100%",minWidth:0,WebkitAppearance:"none"}} type="time" value={visitForm.time||""} onChange={e=>setVisitForm({...visitForm,time:e.target.value})}/></Field>
            {currentSelected&&(currentSelected.vehicles||[]).length>1&&(
              <Field S={S} label="使用車輛">
                <div style={S.radioGroup}>
                  {currentSelected.vehicles.map((v,i)=>{
                    const label=[(v.brand ? v.brand.split(" ")[0] : ""),v.model].filter(Boolean).join(" ")+(v.licensePlate?` (${v.licensePlate})`:"");
                    const active=visitForm.visitLicensePlate===v.licensePlate;
                    return <button key={i} style={{...S.radioBtn,...(active?S.radioBtnActive:{})}} onClick={()=>setVisitForm({...visitForm,visitLicensePlate:v.licensePlate})}>{label}</button>;
                  })}
                </div>
              </Field>
            )}
            <Field S={S} label="服務項目 *">
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {serviceCategories.map(cat=>(
                  <div key={cat.label}>
                    <div style={S.catLabel}>{cat.label}</div>
                    <div style={S.serviceGrid}>{cat.items.map(sv=><button key={sv} style={{...S.serviceBtn,...(visitForm.services.includes(sv)?S.serviceBtnActive:{})}} onClick={()=>toggleService(sv)}>{sv}</button>)}</div>
                  </div>
                ))}
              </div>
            </Field>
            <Field S={S} label="消費方式">
              <div style={S.radioGroup}>{paymentOptions.map(p=><button key={p} style={{...S.radioBtn,...(visitForm.paymentMethod===p?S.radioBtnActive:{})}} onClick={()=>setVisitForm({...visitForm,paymentMethod:p})}>{p}</button>)}</div>
            </Field>
            <Field S={S} label="操作人員">
              <div style={S.radioGroup}>
                {["煎餅","小孟"].map(name=>(
                  <button key={name}
                    style={{...S.radioBtn,...(visitForm.staff===name?S.radioBtnActive:{})}}
                    onClick={()=>setVisitForm({...visitForm,staff:visitForm.staff===name?"":name})}>
                    {name}
                  </button>
                ))}
              </div>
            </Field>
            <Field S={S} label="消費金額 (NT$)"><input style={S.input} type="number" value={visitForm.amount} onChange={e=>setVisitForm({...visitForm,amount:e.target.value})} placeholder="0"/></Field>
            <Field S={S} label="備註"><textarea style={{...S.input,height:68,resize:"vertical"}} value={visitForm.note} onChange={e=>setVisitForm({...visitForm,note:e.target.value})} placeholder="本次特殊情況..."/></Field>
            <div style={S.formBtns}>
              <button style={S.btnCancel} onClick={handleBack}>取消</button>
              <button style={S.btnSave} onClick={saveVisit}>{view==="addVisit"?"新增紀錄":"儲存變更"}</button>
            </div>
          </div>
        )}
      </div>

      {/* Magic Tab bar */}
      {view==="list"&&(
        <div style={S.tabBar}>
          <div style={S.tabBarInner}>
            {[
              {key:"home", svg:(c)=><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill={c} stroke="none"/></svg>},
              {key:"add",  svg:(c)=><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>},
              {key:"search",svg:(c)=><svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" stroke={c}/><line x1="20" y1="20" x2="15.5" y2="15.5" stroke={c}/></svg>},
              {key:"booking",svg:(c)=><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8" y2="14" strokeWidth="3"/><line x1="12" y1="14" x2="12" y2="14" strokeWidth="3"/><line x1="16" y1="14" x2="16" y2="14" strokeWidth="3"/></svg>},
              {key:"settings",svg:(c)=><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>},
            ].map(({key,svg})=>{
              const isActive=tab===key;
              const iconColor=isActive?"#fff":S.tabIconColor(false);
              return (
                <button key={key} style={S.tabBtn}
                  onClick={()=>{setTab(key);setView("list");if(key!=="search")setSearch("");if(key==="add")setCustomerForm(emptyCustomerForm);if(key==="home")setHomeView("main");}}>
                  {isActive
                    ? <div style={S.tabBubble}>{svg(iconColor)}</div>
                    : <div style={{...S.tabIcon,marginBottom:6}}>{svg(iconColor)}</div>
                  }
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
