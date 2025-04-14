import{a as y,u as k,r as O,g as N,j as t}from"./index-CvdZAVXJ.js";y();y();function S(a){const{authButtonId:s,kcContext:n,i18n:i}=a,{url:l,challenge:r,userid:e,username:o,signatureAlgorithms:d,rpEntityName:m,rpId:c,attestationConveyancePreference:g,authenticatorAttachment:u,requireResidentKey:b,userVerificationRequirement:x,createTimeout:f,excludeCredentialIds:j}=n,{msgStr:p,isFetchingTranslations:h}=i,{insertScriptTags:C}=k({componentOrHookName:"LoginRecoveryAuthnCodeConfig",scriptTags:[{type:"module",textContent:()=>`
                    import { registerByWebAuthn } from "${l.resourcesPath}/js/webauthnRegister.js";
                    const registerButton = document.getElementById('${s}');
                    registerButton.addEventListener("click", function() {
                        const input = {
                            challenge : '${r}',
                            userid : '${e}',
                            username : '${o}',
                            signatureAlgorithms : ${JSON.stringify(d)},
                            rpEntityName : ${JSON.stringify(m)},
                            rpId : ${JSON.stringify(c)},
                            attestationConveyancePreference : ${JSON.stringify(g)},
                            authenticatorAttachment : ${JSON.stringify(u)},
                            requireResidentKey : ${JSON.stringify(b)},
                            userVerificationRequirement : ${JSON.stringify(x)},
                            createTimeout : ${f},
                            excludeCredentialIds : ${JSON.stringify(j)},
                            initLabel : ${JSON.stringify(p("webauthn-registration-init-label"))},
                            initLabelPrompt : ${JSON.stringify(p("webauthn-registration-init-label-prompt"))},
                            errmsg : ${JSON.stringify(p("webauthn-unsupported-browser-text"))}
                        };
                        registerByWebAuthn(input);
                    });
                `}]});O.useEffect(()=>{h||C()},[h])}function A(a){const{kcContext:s,i18n:n,doUseDefaultCss:i,Template:l,classes:r}=a,{kcClsx:e}=N({doUseDefaultCss:i,classes:r}),{url:o,isSetRetry:d,isAppInitiatedAction:m}=s,{msg:c,msgStr:g}=n,u="authenticateWebAuthnButton";return S({authButtonId:u,kcContext:s,i18n:n}),t.jsxs(l,Object.assign({kcContext:s,i18n:n,doUseDefaultCss:i,classes:r,headerNode:t.jsxs(t.Fragment,{children:[t.jsx("span",{className:e("kcWebAuthnKeyIcon")}),c("webauthn-registration-title")]})},{children:[t.jsx("form",Object.assign({id:"register",className:e("kcFormClass"),action:o.loginAction,method:"post"},{children:t.jsxs("div",Object.assign({className:e("kcFormGroupClass")},{children:[t.jsx("input",{type:"hidden",id:"clientDataJSON",name:"clientDataJSON"}),t.jsx("input",{type:"hidden",id:"attestationObject",name:"attestationObject"}),t.jsx("input",{type:"hidden",id:"publicKeyCredentialId",name:"publicKeyCredentialId"}),t.jsx("input",{type:"hidden",id:"authenticatorLabel",name:"authenticatorLabel"}),t.jsx("input",{type:"hidden",id:"transports",name:"transports"}),t.jsx("input",{type:"hidden",id:"error",name:"error"}),t.jsx(B,{kcClsx:e,i18n:n})]}))})),t.jsx("input",{type:"submit",className:e("kcButtonClass","kcButtonPrimaryClass","kcButtonBlockClass","kcButtonLargeClass"),id:u,value:g("doRegisterSecurityKey")}),!d&&m&&t.jsx("form",Object.assign({action:o.loginAction,className:e("kcFormClass"),id:"kc-webauthn-settings-form",method:"post"},{children:t.jsx("button",Object.assign({type:"submit",className:e("kcButtonClass","kcButtonDefaultClass","kcButtonBlockClass","kcButtonLargeClass"),id:"cancelWebAuthnAIA",name:"cancel-aia",value:"true"},{children:c("doCancel")}))}))]}))}function B(a){const{kcClsx:s,i18n:n}=a,{msg:i}=n;return t.jsx("div",Object.assign({id:"kc-form-options",className:s("kcFormOptionsClass")},{children:t.jsx("div",Object.assign({className:s("kcFormOptionsWrapperClass")},{children:t.jsx("div",Object.assign({className:"checkbox"},{children:t.jsxs("label",{children:[t.jsx("input",{type:"checkbox",id:"logout-sessions",name:"logout-sessions",value:"on",defaultChecked:!0}),i("logoutOtherSessions")]})}))}))}))}export{A as default};
