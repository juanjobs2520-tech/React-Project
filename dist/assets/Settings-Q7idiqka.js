import{r as c,j as r,B as I,u as Z}from"./index-DEFJ37e6.js";let _={data:""},P=e=>{if(typeof window=="object"){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||_},z=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,D=/\/\*[^]*?\*\/|  +/g,E=/\n+/g,b=(e,t)=>{let a="",s="",o="";for(let l in e){let i=e[l];l[0]=="@"?l[1]=="i"?a=l+" "+i+";":s+=l[1]=="f"?b(i,l):l+"{"+b(i,l[1]=="k"?"":t)+"}":typeof i=="object"?s+=b(i,t?t.replace(/([^,])+/g,d=>l.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,n=>/&/.test(n)?n.replace(/&/g,d):d?d+" "+n:n)):l):i!=null&&(l=l[1]=="-"?l:l.replace(/[A-Z]/g,"-$&").toLowerCase(),o+=b.p?b.p(l,i):l+":"+i+";")}return a+(t&&o?t+"{"+o+"}":o)+s},h={},R=e=>{if(typeof e=="object"){let t="";for(let a in e)t+=a+R(e[a]);return t}return e},B=(e,t,a,s,o)=>{let l=R(e),i=h[l]||(h[l]=(n=>{let p=0,x=11;for(;p<n.length;)x=101*x+n.charCodeAt(p++)>>>0;return"go"+x})(l));if(!h[i]){let n=l!==e?e:(p=>{let x,v,y=[{}];for(;x=z.exec(p.replace(D,""));)x[4]?y.shift():x[3]?(v=x[3].replace(E," ").trim(),y.unshift(y[0][v]=y[0][v]||{})):y[0][x[1]]=x[2].replace(E," ").trim();return y[0]})(e);h[i]=b(o?{["@keyframes "+i]:n}:n,a?"":"."+i)}let d=a&&h.g;return a&&(h.g=h[i]),((n,p,x,v)=>{v?p.data=p.data.replace(v,n):p.data.indexOf(n)===-1&&(p.data=x?n+p.data:p.data+n)})(h[i],t,s,d),i},T=(e,t,a)=>e.reduce((s,o,l)=>{let i=t[l];if(i&&i.call){let d=i(a),n=d&&d.props&&d.props.className||/^go/.test(d)&&d;i=n?"."+n:d&&typeof d=="object"?d.props?"":b(d,""):d===!1?"":d}return s+o+(i??"")},"");function j(e){let t=this||{},a=e.call?e(t.p):e;return B(a.unshift?a.raw?T(a,[].slice.call(arguments,1),t.p):a.reduce((s,o)=>Object.assign(s,o&&o.call?o(t.p):o),{}):a,P(t.target),t.g,t.o,t.k)}let F,C,N;j.bind({g:1});let f=j.bind({k:1});function U(e,t,a,s){b.p=t,F=e,C=a,N=s}function g(e,t){let a=this||{};return function(){let s=arguments;function o(l,i){let d=Object.assign({},l),n=d.className||o.className;a.p=Object.assign({theme:C&&C()},d),a.o=/go\d/.test(n),d.className=j.apply(a,s)+(n?" "+n:"");let p=e;return e[0]&&(p=d.as||e,delete d.as),N&&p[0]&&N(d),F(p,d)}return o}}var J=e=>typeof e=="function",$=(e,t)=>J(e)?e(t):e,q=(()=>{let e=0;return()=>(++e).toString()})(),G=(()=>{let e;return()=>{if(e===void 0&&typeof window<"u"){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),W=20,M="default",O=(e,t)=>{let{toastLimit:a}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,a)};case 1:return{...e,toasts:e.toasts.map(i=>i.id===t.toast.id?{...i,...t.toast}:i)};case 2:let{toast:s}=t;return O(e,{type:e.toasts.find(i=>i.id===s.id)?1:0,toast:s});case 3:let{toastId:o}=t;return{...e,toasts:e.toasts.map(i=>i.id===o||o===void 0?{...i,dismissed:!0,visible:!1}:i)};case 4:return t.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(i=>i.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let l=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(i=>({...i,pauseDuration:i.pauseDuration+l}))}}},Y=[],Q={toasts:[],pausedAt:void 0,settings:{toastLimit:W}},k={},A=(e,t=M)=>{k[t]=O(k[t]||Q,e),Y.forEach(([a,s])=>{a===t&&s(k[t])})},H=e=>Object.keys(k).forEach(t=>A(e,t)),X=e=>Object.keys(k).find(t=>k[t].toasts.some(a=>a.id===e)),S=(e=M)=>t=>{A(t,e)},K=(e,t="blank",a)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...a,id:(a==null?void 0:a.id)||q()}),w=e=>(t,a)=>{let s=K(t,e,a);return S(s.toasterId||X(s.id))({type:2,toast:s}),s.id},m=(e,t)=>w("blank")(e,t);m.error=w("error");m.success=w("success");m.loading=w("loading");m.custom=w("custom");m.dismiss=(e,t)=>{let a={type:3,toastId:e};t?S(t)(a):H(a)};m.dismissAll=e=>m.dismiss(void 0,e);m.remove=(e,t)=>{let a={type:4,toastId:e};t?S(t)(a):H(a)};m.removeAll=e=>m.remove(void 0,e);m.promise=(e,t,a)=>{let s=m.loading(t.loading,{...a,...a==null?void 0:a.loading});return typeof e=="function"&&(e=e()),e.then(o=>{let l=t.success?$(t.success,o):void 0;return l?m.success(l,{id:s,...a,...a==null?void 0:a.success}):m.dismiss(s),o}).catch(o=>{let l=t.error?$(t.error,o):void 0;l?m.error(l,{id:s,...a,...a==null?void 0:a.error}):m.dismiss(s)}),e};var ee=f`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,te=f`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,re=f`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,ae=g("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${ee} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${te} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${re} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,se=f`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,oe=g("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${se} 1s linear infinite;
`,ie=f`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,le=f`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,de=g("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${ie} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${le} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,ne=g("div")`
  position: absolute;
`,ce=g("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,me=f`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,pe=g("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${me} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,ue=({toast:e})=>{let{icon:t,type:a,iconTheme:s}=e;return t!==void 0?typeof t=="string"?c.createElement(pe,null,t):t:a==="blank"?null:c.createElement(ce,null,c.createElement(oe,{...s}),a!=="loading"&&c.createElement(ne,null,a==="error"?c.createElement(ae,{...s}):c.createElement(de,{...s})))},xe=e=>`
0% {transform: translate3d(0,${e*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,fe=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e*-150}%,-1px) scale(.6); opacity:0;}
`,he="0%{opacity:0;} 100%{opacity:1;}",be="0%{opacity:1;} 100%{opacity:0;}",ge=g("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,ve=g("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,ye=(e,t)=>{let a=e.includes("top")?1:-1,[s,o]=G()?[he,be]:[xe(a),fe(a)];return{animation:t?`${f(s)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${f(o)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}};c.memo(({toast:e,position:t,style:a,children:s})=>{let o=e.height?ye(e.position||t||"top-center",e.visible):{opacity:0},l=c.createElement(ue,{toast:e}),i=c.createElement(ve,{...e.ariaProps},$(e.message,e));return c.createElement(ge,{className:e.className,style:{...o,...a,...e.style}},typeof s=="function"?s({icon:l,message:i}):c.createElement(c.Fragment,null,l,i))});U(c.createElement);j`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;var V=m;const u={},L=(e,t,a)=>{V.custom(s=>r.jsxs("div",{className:`${s.visible?"animate-enter":"animate-leave"}
      max-w-md w-full ${a=="0"?"bg-[#04b20c]":a=="1"?"bg-[#eab90f]":"bg-[#e13f32]"} shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`,children:[r.jsx("div",{className:"flex-1 w-0 p-4 ",children:r.jsx("div",{className:"flex items-start",children:r.jsxs("div",{className:"ml-3 flex-1",children:[r.jsx("p",{className:"text-sm font-medium text-white",children:e}),r.jsx("p",{className:"mt-1 text-sm text-white",children:t})]})})}),r.jsx("div",{className:"flex",children:r.jsx("button",{onClick:()=>V.dismiss(s.id),type:"button",className:"mr-2 box-content rounded-none border-none opacity-100 hover:no-underline hover:opacity-50 focus:opacity-50 focus:shadow-none focus:outline-none text-white","data-te-toast-dismiss":!0,"aria-label":"Close",children:r.jsx("span",{className:"w-[1em] focus:opacity-100 disabled:pointer-events-none disabled:select-none disabled:opacity-25 [&.disabled]:pointer-events-none [&.disabled]:select-none [&.disabled]:opacity-25",children:r.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",className:"h-6 w-6",children:r.jsx("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M6 18L18 6M6 6l12 12"})})})})})]}))},ke=()=>{const e=localStorage.getItem("alertSettings");if(e)for(const t of JSON.parse(e)){console.log(t);const a=isNaN(parseFloat(t.value))?t.value:parseFloat(t.value),s=t.criterion<2?"delta_"+t.para:t.para;if(t.id=="ALL")Object.keys(u).map(o=>{const l=t.criterion=="0"?a<=-1*u[o][s]:t.criterion=="1"||t.criterion=="3"?a>=u[o][s]:t.criterion=="2"?a<=u[o][s]:a==u[o][s],i=t.criterion=="0"?u[o][s]*-1:u[o][s];if(l){const d=`${t.para} of ${o} ${t.criterion==0?"goes down by":t.criterion==1?"goes up by":t.criterion==2?"is smaller than":t.criterion==3?"is greater than":"is equal to"} ${i}`;L(o,d,t.type)}});else{const o=t.id,l=t.criterion=="0"?a>=-1*u[o][s]:t.criterion=="1"||t.criterion=="3"?a>=u[o][s]:t.criterion=="2"?a<=u[o][s]:a==u[o][s],i=t.criterion=="0"?u[o][s]*-1:u[o][s];if(l){const d=`${t.para} of ${o} ${t.criterion==0?"goes down by":t.criterion==1?"goes up by":t.criterion==2?"is smaller than":t.criterion==3?"is greater than":"is equal to"} ${i}`;L(o,d,t.type)}}}},je=()=>{const[e,t]=c.useState(!1),[a,s]=c.useState(localStorage.getItem("alertSettings")?JSON.parse(localStorage.getItem("alertSettings")):[]);c.useEffect(()=>{localStorage.setItem("alertSettings",JSON.stringify(a))},[a]);const[o,l]=c.useState(null);return r.jsx(r.Fragment,{children:r.jsxs("div",{className:"mx-auto max-w-270",children:[r.jsx(I,{pageName:"Settings"}),r.jsxs("div",{className:"grid grid-cols-5 gap-8",children:[r.jsx("div",{className:"col-span-5 xl:col-span-3",children:r.jsxs("div",{className:"rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark",children:[r.jsx("div",{className:"border-b border-stroke py-4 px-7 dark:border-strokedark",children:r.jsx("h3",{className:"font-medium text-black dark:text-white",children:"Personal Information"})}),r.jsx("div",{className:"p-7",children:r.jsxs("form",{action:"#",children:[r.jsxs("div",{className:"mb-5.5 flex flex-col gap-5.5 sm:flex-row",children:[r.jsxs("div",{className:"w-full sm:w-1/2",children:[r.jsx("label",{className:"mb-3 block text-sm font-medium text-black dark:text-white",htmlFor:"fullName",children:"Full Name"}),r.jsxs("div",{className:"relative",children:[r.jsx("span",{className:"absolute left-4.5 top-4",children:r.jsx("svg",{className:"fill-current",width:"20",height:"20",viewBox:"0 0 20 20",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:r.jsxs("g",{opacity:"0.8",children:[r.jsx("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z",fill:""}),r.jsx("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z",fill:""})]})})}),r.jsx("input",{className:"w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary",type:"text",name:"fullName",id:"fullName",placeholder:"Devid Jhon",defaultValue:"Devid Jhon"})]})]}),r.jsxs("div",{className:"w-full sm:w-1/2",children:[r.jsx("label",{className:"mb-3 block text-sm font-medium text-black dark:text-white",htmlFor:"phoneNumber",children:"Phone Number"}),r.jsx("input",{className:"w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary",type:"text",name:"phoneNumber",id:"phoneNumber",placeholder:"+990 3343 7865",defaultValue:"+990 3343 7865"})]})]}),r.jsxs("div",{className:"mb-5.5",children:[r.jsx("label",{className:"mb-3 block text-sm font-medium text-black dark:text-white",htmlFor:"emailAddress",children:"Email Address"}),r.jsxs("div",{className:"relative",children:[r.jsx("span",{className:"absolute left-4.5 top-4",children:r.jsx("svg",{className:"fill-current",width:"20",height:"20",viewBox:"0 0 20 20",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:r.jsxs("g",{opacity:"0.8",children:[r.jsx("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M3.33301 4.16667C2.87658 4.16667 2.49967 4.54357 2.49967 5V15C2.49967 15.4564 2.87658 15.8333 3.33301 15.8333H16.6663C17.1228 15.8333 17.4997 15.4564 17.4997 15V5C17.4997 4.54357 17.1228 4.16667 16.6663 4.16667H3.33301ZM0.833008 5C0.833008 3.6231 1.9561 2.5 3.33301 2.5H16.6663C18.0432 2.5 19.1663 3.6231 19.1663 5V15C19.1663 16.3769 18.0432 17.5 16.6663 17.5H3.33301C1.9561 17.5 0.833008 16.3769 0.833008 15V5Z",fill:""}),r.jsx("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M0.983719 4.52215C1.24765 4.1451 1.76726 4.05341 2.1443 4.31734L9.99975 9.81615L17.8552 4.31734C18.2322 4.05341 18.7518 4.1451 19.0158 4.52215C19.2797 4.89919 19.188 5.4188 18.811 5.68272L10.4776 11.5161C10.1907 11.7169 9.80879 11.7169 9.52186 11.5161L1.18853 5.68272C0.811486 5.4188 0.719791 4.89919 0.983719 4.52215Z",fill:""})]})})}),r.jsx("input",{className:"w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary",type:"email",name:"emailAddress",id:"emailAddress",placeholder:"devidjond45@gmail.com",defaultValue:"devidjond45@gmail.com"})]})]}),r.jsxs("div",{className:"mb-5.5",children:[r.jsx("label",{className:"mb-3 block text-sm font-medium text-black dark:text-white",htmlFor:"Username",children:"Username"}),r.jsx("input",{className:"w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary",type:"text",name:"Username",id:"Username",placeholder:"devidjhon24",defaultValue:"devidjhon24"})]}),r.jsxs("div",{className:"mb-5.5",children:[r.jsx("label",{className:"mb-3 block text-sm font-medium text-black dark:text-white",htmlFor:"Username",children:"BIO"}),r.jsxs("div",{className:"relative",children:[r.jsx("span",{className:"absolute left-4.5 top-4",children:r.jsxs("svg",{className:"fill-current",width:"20",height:"20",viewBox:"0 0 20 20",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:[r.jsxs("g",{opacity:"0.8",clipPath:"url(#clip0_88_10224)",children:[r.jsx("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M1.56524 3.23223C2.03408 2.76339 2.66997 2.5 3.33301 2.5H9.16634C9.62658 2.5 9.99967 2.8731 9.99967 3.33333C9.99967 3.79357 9.62658 4.16667 9.16634 4.16667H3.33301C3.11199 4.16667 2.90003 4.25446 2.74375 4.41074C2.58747 4.56702 2.49967 4.77899 2.49967 5V16.6667C2.49967 16.8877 2.58747 17.0996 2.74375 17.2559C2.90003 17.4122 3.11199 17.5 3.33301 17.5H14.9997C15.2207 17.5 15.4326 17.4122 15.5889 17.2559C15.7452 17.0996 15.833 16.8877 15.833 16.6667V10.8333C15.833 10.3731 16.2061 10 16.6663 10C17.1266 10 17.4997 10.3731 17.4997 10.8333V16.6667C17.4997 17.3297 17.2363 17.9656 16.7674 18.4344C16.2986 18.9033 15.6627 19.1667 14.9997 19.1667H3.33301C2.66997 19.1667 2.03408 18.9033 1.56524 18.4344C1.0964 17.9656 0.833008 17.3297 0.833008 16.6667V5C0.833008 4.33696 1.0964 3.70107 1.56524 3.23223Z",fill:""}),r.jsx("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M16.6664 2.39884C16.4185 2.39884 16.1809 2.49729 16.0056 2.67253L8.25216 10.426L7.81167 12.188L9.57365 11.7475L17.3271 3.99402C17.5023 3.81878 17.6008 3.5811 17.6008 3.33328C17.6008 3.08545 17.5023 2.84777 17.3271 2.67253C17.1519 2.49729 16.9142 2.39884 16.6664 2.39884ZM14.8271 1.49402C15.3149 1.00622 15.9765 0.732178 16.6664 0.732178C17.3562 0.732178 18.0178 1.00622 18.5056 1.49402C18.9934 1.98182 19.2675 2.64342 19.2675 3.33328C19.2675 4.02313 18.9934 4.68473 18.5056 5.17253L10.5889 13.0892C10.4821 13.196 10.3483 13.2718 10.2018 13.3084L6.86847 14.1417C6.58449 14.2127 6.28409 14.1295 6.0771 13.9225C5.87012 13.7156 5.78691 13.4151 5.85791 13.1312L6.69124 9.79783C6.72787 9.65131 6.80364 9.51749 6.91044 9.41069L14.8271 1.49402Z",fill:""})]}),r.jsx("defs",{children:r.jsx("clipPath",{id:"clip0_88_10224",children:r.jsx("rect",{width:"20",height:"20",fill:"white"})})})]})}),r.jsx("textarea",{className:"w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary",name:"bio",id:"bio",rows:6,placeholder:"Write your bio here",defaultValue:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque posuere fermentum urna, eu condimentum mauris tempus ut. Donec fermentum blandit aliquet."})]})]}),r.jsxs("div",{className:"flex justify-end gap-4.5",children:[r.jsx("button",{className:"flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white",type:"submit",children:"Cancel"}),r.jsx("button",{className:"flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:shadow-1",type:"submit",onClick:ke,children:"Save"})]})]})})]})}),r.jsx("div",{className:"col-span-5 xl:col-span-2",children:r.jsxs("div",{className:"rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark",children:[r.jsx("div",{className:"border-b border-stroke py-4 px-7 dark:border-strokedark",children:r.jsx("h3",{className:"font-medium text-black dark:text-white",children:"Your Photo"})}),r.jsx("div",{className:"p-7",children:r.jsxs("form",{action:"#",children:[r.jsxs("div",{className:"mb-4 flex items-center gap-3",children:[r.jsx("div",{className:"h-14 w-14 rounded-full",children:r.jsx("img",{src:Z,alt:"User"})}),r.jsxs("div",{children:[r.jsx("span",{className:"mb-1.5 text-black dark:text-white",children:"Edit your photo"}),r.jsxs("span",{className:"flex gap-2.5",children:[r.jsx("button",{className:"text-sm hover:text-primary",children:"Delete"}),r.jsx("button",{className:"text-sm hover:text-primary",children:"Update"})]})]})]}),r.jsxs("div",{id:"FileUpload",className:"relative mb-5.5 block w-full cursor-pointer appearance-none rounded border-2 border-dashed border-primary bg-gray py-4 px-4 dark:bg-meta-4 sm:py-7.5",children:[r.jsx("input",{type:"file",accept:"image/*",className:"absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"}),r.jsxs("div",{className:"flex flex-col items-center justify-center space-y-3",children:[r.jsx("span",{className:"flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-white dark:border-strokedark dark:bg-boxdark",children:r.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:[r.jsx("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M1.99967 9.33337C2.36786 9.33337 2.66634 9.63185 2.66634 10V12.6667C2.66634 12.8435 2.73658 13.0131 2.8616 13.1381C2.98663 13.2631 3.1562 13.3334 3.33301 13.3334H12.6663C12.8431 13.3334 13.0127 13.2631 13.1377 13.1381C13.2628 13.0131 13.333 12.8435 13.333 12.6667V10C13.333 9.63185 13.6315 9.33337 13.9997 9.33337C14.3679 9.33337 14.6663 9.63185 14.6663 10V12.6667C14.6663 13.1971 14.4556 13.7058 14.0806 14.0809C13.7055 14.456 13.1968 14.6667 12.6663 14.6667H3.33301C2.80257 14.6667 2.29387 14.456 1.91879 14.0809C1.54372 13.7058 1.33301 13.1971 1.33301 12.6667V10C1.33301 9.63185 1.63148 9.33337 1.99967 9.33337Z",fill:"#3C50E0"}),r.jsx("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M7.5286 1.52864C7.78894 1.26829 8.21106 1.26829 8.4714 1.52864L11.8047 4.86197C12.0651 5.12232 12.0651 5.54443 11.8047 5.80478C11.5444 6.06513 11.1223 6.06513 10.8619 5.80478L8 2.94285L5.13807 5.80478C4.87772 6.06513 4.45561 6.06513 4.19526 5.80478C3.93491 5.54443 3.93491 5.12232 4.19526 4.86197L7.5286 1.52864Z",fill:"#3C50E0"}),r.jsx("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M7.99967 1.33337C8.36786 1.33337 8.66634 1.63185 8.66634 2.00004V10C8.66634 10.3682 8.36786 10.6667 7.99967 10.6667C7.63148 10.6667 7.33301 10.3682 7.33301 10V2.00004C7.33301 1.63185 7.63148 1.33337 7.99967 1.33337Z",fill:"#3C50E0"})]})}),r.jsxs("p",{children:[r.jsx("span",{className:"text-primary",children:"Click to upload"})," or drag and drop"]}),r.jsx("p",{className:"mt-1.5",children:"SVG, PNG, JPG or GIF"}),r.jsx("p",{children:"(max, 800 X 800px)"})]})]}),r.jsxs("div",{className:"flex justify-end gap-4.5",children:[r.jsx("button",{className:"flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white",type:"submit",children:"Cancel"}),r.jsx("button",{className:"flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-70",type:"submit",children:"Save"})]})]})})]})})]})]})})};export{je as default};
