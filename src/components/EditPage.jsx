import { useEffect, useRef, useState } from "react"
import "./styles/edit_page.css"
import * as pdfjs from "pdfjs-dist"
import * as pdfjsViewer from "pdfjs-dist/web/pdf_viewer.mjs"
import { SignatureManager } from "./assets/signature_manager"
import { SignatureStorage } from "./assets/generic_signature_storage"
import { OverlayManager } from "./assets/overlay_manager"
import "pdfjs-dist/web/pdf_viewer.css"
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url"

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
export default function EditPage() {

  const [pdfDocument, setPDFDocument] = useState(null)
  // console.log(pdfDocument);

  function UploadPDF() {

    async function loadPDF({target}) {
      const file = target.files[0]
      const url = URL.createObjectURL(file)
      const pdf = await pdfjs.getDocument(url).promise
      setPDFDocument(pdf)
      setMode("edit")
    }

    return (
      <>
        <div className="header">
          <div className="icon"></div>
          <div className="text">The Most Comprehensive PDF Reader/Editor</div>
        </div>
        <label className="uploadPDF">
          <div></div>
          <input onChange={loadPDF} type="file" hidden/>
        </label>
      </>
    )
  }

  function Application() {

    const pdfViewer = useRef(null)
    const ac = useRef(new AbortController)
    const eventBus = useRef(new pdfjsViewer.EventBus())

    const menuOptionsOpen = useRef(false)
    const scaleInputText = useRef("")

    const [fitToWidth, setFitToWidth] = useState(false)

    useEffect(() => {

      const container = document.getElementById("viewerContainer")
      const viewer = document.getElementById("viewer")

      const signatureManagerDivs = {
        dialog: document.getElementById("addSignatureDialog"),
        panels: document.getElementById("addSignatureActionContainer"),
        typeButton: document.getElementById("addSignatureTypeButton"),
        typeInput: document.getElementById("addSignatureTypeInput"),
        drawButton: document.getElementById("addSignatureDrawButton"),
        drawSVG: document.getElementById("addSignatureDraw"),
        drawPlaceholder: document.getElementById("addSignatureDrawPlaceholder"),
        drawThickness: document.getElementById("addSignatureDrawThickness"),
        imageButton: document.getElementById("addSignatureImageButton"),
        imageSVG: document.getElementById("addSignatureImage"),
        imagePlaceholder: document.getElementById("addSignatureImagePlaceholder"),
        imagePicker: document.getElementById("addSignatureFilePicker"),
        imagePickerLink: document.getElementById("addSignatureImageBrowse"),
        description: document.getElementById("addSignatureDescription"),
        clearButton: document.getElementById("clearSignatureButton"),
        saveContainer: document.getElementById("addSignatureSaveContainer"),
        saveCheckbox: document.getElementById("addSignatureSaveCheckbox"),
        errorBar: document.getElementById("addSignatureError"),
        errorCloseButton: document.getElementById("addSignatureErrorCloseButton"),
        cancelButton: document.getElementById("addSignatureCancelButton"),
        addButton: document.getElementById("addSignatureAddButton"),
      }
      const sig2 = document.getElementById("editorSignatureAddSignature")
      const sig3 = {
        dialog: document.getElementById("editSignatureDescriptionDialog"),
        description: document.getElementById("editSignatureDescription"),
        editSignatureView: document.getElementById("editSignatureView"),
        cancelButton: document.getElementById("editSignatureCancelButton"),
        updateButton: document.getElementById("editSignatureUpdateButton")
      }

      const signatureManager = new SignatureManager(signatureManagerDivs, sig3, sig2, new OverlayManager(), null, new SignatureStorage(eventBus.current), eventBus.current)
      

      pdfViewer.current = new pdfjsViewer.PDFViewer({container, viewer, eventBus: eventBus.current, signatureManager, annotationMode:2, annotationEditorMode:0, textLayerMode:1, annotationEditorHighlightColors:"yellow=#FFFF98,green=#53FFBC,blue=#80EBFF,pink=#FFCBE6,red=#FF4F5F"})
      pdfViewer.current.setDocument(pdfDocument)

      const pdfLinkService = new pdfjsViewer.PDFLinkService({eventBus: eventBus.current})
      pdfLinkService.setViewer(pdfViewer.current)
      pdfLinkService.setDocument(pdfDocument)

      eventBus.current._on("switchannotationeditormode", (evt)=>{console.log(evt);pdfViewer.current.annotationEditorMode = evt})

      setTimeout(()=>pdfViewer.current.currentScale = 1, 100)

     

    }, [])
    
    function zoomIn() {
      pdfViewer.current.updateScale({drawingDelay: 400, steps: 1})
      document.getElementById("scaleInput").value = `${Math.round(pdfViewer.current.currentScale*100)}%`
    }

    function zoomOut() {
      pdfViewer.current.updateScale({drawingDelay: 400, steps: -1})
      document.getElementById("scaleInput").value = `${Math.round(pdfViewer.current.currentScale*100)}%`
    }

    function onScaleInputFocus(e) {
      scaleInputText.current = pdfViewer.current.currentScale
      e.target.select()
    } 

    // function updateScale(e) {
    //   //TODO: filter input
    //   if(!e.target.value.includes("%")) {
    //     console.log(e.target.value);
    //     pdfViewer.current.currentScale = Number(e.target.value)/100
    //     // document.getElementById("scaleInput").value = `${e.value}%`
    //   }
    // }

    function onScaleInputBlur(e) {
      if((e.type === "keydown" && e.key === "Enter") || e.type === "blur") {
        const regex = /(\d{1,3})/
        const newScale = e.target.value.match(regex)
        console.log(newScale);
        if(newScale && Number(newScale[0]) > 0 && Number(newScale[0]) < 1000) {
          pdfViewer.current.currentScale = Number(newScale[0])/100
          e.target.value = `${newScale[0]}%`
          e.target.blur()
        } else {
          pdfViewer.current.currentScale = scaleInputText.current
          e.target.value = `${Math.round(scaleInputText.current*100)}%`
        }
      }
    }

    function fitPageWidth() {
      console.log("page-width");
      pdfViewer.current.currentScaleValue = "page-width"
      document.getElementById("scaleInput").value = `${(Math.round(pdfViewer.current.currentScale*100))}%`
      setFitToWidth(false)
    }

    function fitPageHeight() {
      console.log("page-fit");
      pdfViewer.current.currentScaleValue = "page-fit"
      document.getElementById("scaleInput").value = `${(Math.round(pdfViewer.current.currentScale*100))}%`
      setFitToWidth(true)
    }

    function openMenu() {
      const div = document.getElementById("menuOptions")
      
      if(!menuOptionsOpen.current) {
        div.style.display = "flex"  
        menuOptionsOpen.current = true
      } else {
        div.style.display = "none"  
        menuOptionsOpen.current = false
      }
    }

    function showPDFInfo() {

    }
    function printPDF() {

    }

    function downloadPDF() {
      if(pdfDocument.annotationStorage.size > 0) {
        pdfDocument.saveDocument().then(data => (new pdfjsViewer.DownloadManager()).download(data, "dada", "dada"))
      } else {
        pdfDocument.getData().then(data => (new pdfjsViewer.DownloadManager()).download(data, "dada", "dada"))
      }
    }

    function openEditMode() {
      const div = document.getElementById("editingToolbar")
      div.style.display = "flex"
      const div2 = document.getElementById("asd")
      div2.style.display = "none"
      document.documentElement.style.setProperty("--viewer-margin", "108px")
    }

    function closeEditMode() {
      const div = document.getElementById("editingToolbar")
      div.style.display = ""
      const div2 = document.getElementById("asd")
      div2.style.display = ""
      document.documentElement.style.setProperty("--viewer-margin", "60px")
    }

    function highlightModeOn() {
      if(pdfViewer.current.annotationEditorMode !== pdfjs.AnnotationEditorType.HIGHLIGHT) {
        pdfViewer.current.annotationEditorMode = {mode: pdfjs.AnnotationEditorType.HIGHLIGHT}
        document.getElementById("editorToolsParams").style.display = "block"
        document.getElementById("highlightParams").style.display = ""
        document.getElementById("signatureParams").style.display = "none"
        document.getElementById("inkParams").style.display = "none"
        document.getElementById("freeTextParams").style.display = "none"
        document.getElementById("editorToolsParams").style.top = ""
      } else {
        pdfViewer.current.annotationEditorMode = {mode: pdfjs.AnnotationEditorType.NONE}
        document.getElementById("editorToolsParams").style.display = ""
      }
    }
    function changeHighlightColor(e) {
      console.log(e.target.value);
      eventBus.current.dispatch("switchannotationeditorparams", {type: pdfjs.AnnotationEditorParamsType.HIGHLIGHT_DEFAULT_COLOR, value: e.target.value})

    }
    function changeHighlightSize(e) {
      eventBus.current.dispatch("switchannotationeditorparams", {type: pdfjs.AnnotationEditorParamsType.HIGHLIGHT_THICKNESS, value: e.target.valueAsNumber})
    }
    function showHighlight(e) {
      console.log(e.target.checked, typeof e.target.checked);
      eventBus.current.dispatch("switchannotationeditorparams", {type: pdfjs.AnnotationEditorParamsType.HIGHLIGHT_SHOW_ALL, value: e.target.checked})
    }

    function signatureMode() {
      if(pdfViewer.current.annotationEditorMode !== pdfjs.AnnotationEditorType.SIGNATURE) {
        pdfViewer.current.annotationEditorMode = {mode: pdfjs.AnnotationEditorType.SIGNATURE}
        document.getElementById("editorToolsParams").style.display = "block"
        document.getElementById("highlightParams").style.display = "none"
        document.getElementById("signatureParams").style.display = ""
        document.getElementById("inkParams").style.display = "none"
        document.getElementById("freeTextParams").style.display = "none"
        document.getElementById("editorToolsParams").style.top = ""
      } else {
        pdfViewer.current.annotationEditorMode = {mode: pdfjs.AnnotationEditorType.NONE}
        document.getElementById("editorToolsParams").style.display = ""
      }
    }
    function addSignature() {
      eventBus.current.dispatch("switchannotationeditorparams", {type: pdfjs.AnnotationEditorParamsType.CREATE})
    }

    function inkMode() {
      if(pdfViewer.current.annotationEditorMode !== pdfjs.AnnotationEditorType.INK) {
        // pdfViewer.current.annotationEditorMode = {mode: pdfjs.AnnotationEditorType.INK}
        eventBus.current.dispatch("switchannotationeditormode", {mode: pdfjs.AnnotationEditorType.INK})
        document.getElementById("editorToolsParams").style.display = "block"
        document.getElementById("highlightParams").style.display = "none"
        document.getElementById("signatureParams").style.display = "none"
        document.getElementById("inkParams").style.display = ""
        document.getElementById("freeTextParams").style.display = "none"
        document.getElementById("editorToolsParams").style.top = ""
      } else {
        eventBus.current.dispatch("switchannotationeditormode", {mode: pdfjs.AnnotationEditorType.NONE})
        // pdfViewer.current.annotationEditorMode = {mode: pdfjs.AnnotationEditorType.NONE}
        document.getElementById("editorToolsParams").style.display = ""
      }
    }
    function changeInkColor(e) {
      eventBus.current.dispatch("switchannotationeditorparams", {type: pdfjs.AnnotationEditorParamsType.INK_COLOR, value: e.target.value})
    }
    function changeInkSize(e) {
      eventBus.current.dispatch("switchannotationeditorparams", {type: pdfjs.AnnotationEditorParamsType.INK_THICKNESS, value: e.target.valueAsNumber})
    }
    function changeInkOpacity(e) {
      eventBus.current.dispatch("switchannotationeditorparams", {type: pdfjs.AnnotationEditorParamsType.INK_OPACITY, value: e.target.valueAsNumber/100})
    }

    function freeTextMode() {
      if(pdfViewer.current.annotationEditorMode !== pdfjs.AnnotationEditorType.FREETEXT) {
        pdfViewer.current.annotationEditorMode = {mode: pdfjs.AnnotationEditorType.FREETEXT}
        document.getElementById("editorToolsParams").style.display = "block"
        document.getElementById("highlightParams").style.display = "none"
        document.getElementById("signatureParams").style.display = "none"
        document.getElementById("inkParams").style.display = "none"
        document.getElementById("freeTextParams").style.display = ""
        document.getElementById("editorToolsParams").style.top = ""
      } else {
        pdfViewer.current.annotationEditorMode = {mode: pdfjs.AnnotationEditorType.NONE}
        document.getElementById("editorToolsParams").style.display = ""
      }
    }
    function changeFreeTextColor(e) {
      eventBus.current.dispatch("switchannotationeditorparams", {type: pdfjs.AnnotationEditorParamsType.FREETEXT_COLOR, value: e.target.value})
    }
    function changeFreeTextSize(e) {
      eventBus.current.dispatch("switchannotationeditorparams", {type: pdfjs.AnnotationEditorParamsType.FREETEXT_SIZE, value: e.target.valueAsNumber})
    }

    function minimizeEditorParams() {
      const div = document.getElementById("editorToolsParams")
      console.log(div.style.top);
      if(div.style.top === "") {
        div.style.top = "60px"
      } else {
        div.style.top = ""
      }
    }


    return (
      <>
      <div className="background"></div>
        <div className="controls">
          <div className="menu">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg>
          </div>
          <div onClick={zoomIn} className="button">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>
          </div>
          <input id="scaleInput" onFocus={onScaleInputFocus} onBlur={onScaleInputBlur} onKeyDown={onScaleInputBlur} className="scaling" type="text" defaultValue="100%" />
          <div className="buttons2">
            <svg onClick={zoomOut} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M200-440v-80h560v80H200Z"/></svg>
            {fitToWidth ? 
              <svg onClick={fitPageWidth} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm640-560H160v480h640v-480Zm-640 0v480-480Zm200 360v-240L240-480l120 120Zm360-120L600-600v240l120-120Z"/></svg>
             :<svg onClick={fitPageHeight} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h480q33 0 56.5 23.5T800-800v640q0 33-23.5 56.5T720-80H240Zm480-80v-640H240v640h480Zm0-640H240h480ZM360-600h240L480-720 360-600Zm120 360 120-120H360l120 120Z"/></svg>
            }
          </div>
          <div className="more">
            <svg onClick={openMenu} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z"/></svg>
            <div id="menuOptions" className="options">
              <div onClick={showPDFInfo}>Info</div>
              <div onClick={printPDF}>Print</div>
              <div onClick={downloadPDF}>Download</div>
            </div>
          </div>
        </div>
        <div className="edit_controls">
          <div id="editingToolbar" className="toolbar">
            <svg onClick={highlightModeOn} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#701F1F"><path d="M544-400 440-504 240-304l104 104 200-200Zm-47-161 104 104 199-199-104-104-199 199Zm-84-28 216 216-229 229q-24 24-56 24t-56-24l-2-2-26 26H60l126-126-2-2q-24-24-24-56t24-56l229-229Zm0 0 227-227q24-24 56-24t56 24l104 104q24 24 24 56t-24 56L629-373 413-589Z"/></svg>
            <svg onClick={signatureMode} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#701F1F"><path d="m499-287 335-335-52-52-335 335 52 52Zm-379-62q0 29 20 45t66 21q16 2 25.5 14.5T240-240q-1 17-12 28t-27 9q-81-10-121-46.5T40-349q0-65 53.5-105.5T242-503q39-3 58.5-12.5T320-542q0-22-21-34.5T230-596q-16-2-25.5-15t-7.5-29q2-17 14-27.5t28-8.5q83 12 122 44.5t39 89.5q0 53-38.5 83T248-423q-64 5-96 23.5T120-349Zm398 156L353-358l382-382q20-20 47.5-20t47.5 20l70 70q20 20 20 47.5T900-575L518-193Zm-159 33q-17 4-30-9t-9-30l33-159 165 165-159 33Z"/></svg>
            <svg onClick={inkMode} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#701F1F"><path d="m490-527 37 37 217-217-37-37-217 217ZM200-200h37l233-233-37-37-233 233v37Zm355-205L405-555l167-167-29-29-191 191q-12 12-28 12t-28-12q-12-12-12-28.5t12-28.5l190-190q24-24 56.5-24t56.5 24l29 29 50-50q12-12 28.5-12t28.5 12l93 93q12 12 12 28.5T828-678L555-405ZM160-120q-17 0-28.5-11.5T120-160v-77q0-16 6-30.5t17-25.5l262-262 150 150-262 262q-11 11-25.5 17t-30.5 6h-77Z"/></svg>
            <svg onClick={freeTextMode} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#701F1F"><path d="M420-680H260q-25 0-42.5-17.5T200-740q0-25 17.5-42.5T260-800h440q25 0 42.5 17.5T760-740q0 25-17.5 42.5T700-680H540v460q0 25-17.5 42.5T480-160q-25 0-42.5-17.5T420-220v-460Z"/></svg>
            <svg onClick={closeEditMode} className="close" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#701F1F"><path d="M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z"/></svg>
          </div>
          <div id="editorToolsParams" className="editor_tools_params">
            <div id="highlightParams" className="highlight_params">
              <div className="option">
                <label htmlFor="highlight-color">Color</label>
                <input onInput={changeHighlightColor} id="highlight-color" type="color" defaultValue="#FFFF98"/>
              </div>
              <div className="option">
                <label htmlFor="highlight-thickness">Size</label>
                <input onInput={changeHighlightSize} id="highlight-thickness" type="range" min="1" max="10" step="1" />
              </div>
              <div className="option">
                <label htmlFor="show-highlight">Show</label>
                <input onChange={showHighlight} id="show-highlight" type="checkbox" defaultChecked/>
              </div>
            </div>
            <div onClick={minimizeEditorParams} className="minimize">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z"/></svg>
            </div>
            <div id="signatureParams" className="signature_params">
              <div className="saved_signatures_list">
                <button id="editorSignatureAddSignature" hidden></button>
              </div>
              <button onClick={addSignature} className="add_signature">+ New</button>
            </div>
            <div id="inkParams" className="ink_params">
              <div className="option">
                <label htmlFor="ink-color">Color</label>
                <input onInput={changeInkColor} id="ink-color" type="color" defaultValue="#000000"/>
              </div>
              <div className="option">
                <label htmlFor="ink-thickness">Size</label>
                <input onInput={changeInkSize} id="ink-thickness" type="range" min="1" max="10" step="1" defaultValue="1" />
              </div>
              <div className="option">
                <label htmlFor="ink-highlight">Opacity</label>
                <input onChange={changeInkOpacity} id="ink-highlight" type="range" min="10" max="100" defaultValue="100" />
              </div>
            </div>
            <div id="freeTextParams" className="freetext_params">
              <div className="option">
                <label htmlFor="freeText-color">Color</label>
                <input onInput={changeFreeTextColor} id="freeText-color" type="color" defaultValue="#000000"/>
              </div>
              <div className="option">
                <label htmlFor="freeText-thickness">Size</label>
                <input onInput={changeFreeTextSize} id="freeText-thickness" type="range" min="4" max="48" step="1" defaultValue="10" />
              </div>
            </div>
          </div>
          <div id="asd" onClick={openEditMode} className="button">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M200-200h57l391-391-57-57-391 391v57Zm-40 80q-17 0-28.5-11.5T120-160v-97q0-16 6-30.5t17-25.5l505-504q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L313-143q-11 11-25.5 17t-30.5 6h-97Zm600-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
          </div>
        </div>
        {/* <div className="pppp">
          <button id="editorSignatureAddSignature" onClick={addSignature}>+ Add signature</button>
        </div> */}
        <dialog className="dialog signatureDialog" id="addSignatureDialog" aria-labelledby="addSignatureDialogLabel" open="">
          <span id="addSignatureDialogLabel" data-l10n-id="pdfjs-editor-add-signature-dialog-label">This modal allows the user to create a signature to add to a PDF document. The user can edit the name (which also serves as the alt text), and optionally save the signature for repeated use.</span>
          <div id="addSignatureContainer" className="mainContainer">
            <div className="title">
              <span role="sectionhead" data-l10n-id="pdfjs-editor-add-signature-dialog-title" tabIndex="0">Add a signature</span>
            </div>
            <div role="tablist" id="addSignatureOptions">
              <button id="addSignatureTypeButton" type="button" role="tab" aria-selected="true" aria-controls="addSignatureTypeContainer" data-l10n-id="pdfjs-editor-add-signature-type-button" tabIndex="0" title="Type">Type</button>
              <button id="addSignatureDrawButton" type="button" role="tab" aria-selected="false" aria-controls="addSignatureDrawContainer" data-l10n-id="pdfjs-editor-add-signature-draw-button" tabIndex="-1" title="Draw">Draw</button>
              <button id="addSignatureImageButton" type="button" role="tab" aria-selected="false" aria-controls="addSignatureImageContainer" data-l10n-id="pdfjs-editor-add-signature-image-button" tabIndex="-1" title="Image">Image</button>
            </div>
            <div id="addSignatureActionContainer" data-selected="type">
              <div id="addSignatureTypeContainer" role="tabpanel" aria-labelledby="addSignatureTypeContainer">
                <input id="addSignatureTypeInput" type="text" data-l10n-id="pdfjs-editor-add-signature-type-input" tabIndex="0" aria-label="Type your signature" placeholder="Type your signature" />
              </div>
              <div id="addSignatureDrawContainer" role="tabpanel" aria-labelledby="addSignatureDrawButton" tabIndex="-1">
                <svg id="addSignatureDraw" xmlns="http://www.w3.org/2000/svg" aria-labelledby="addSignatureDrawPlaceholder"></svg>
                <span id="addSignatureDrawPlaceholder" data-l10n-id="pdfjs-editor-add-signature-draw-placeholder">Draw your signature</span>
                <div id="thickness">
                  <div>
                    <label htmlFor="addSignatureDrawThickness" data-l10n-id="pdfjs-editor-add-signature-draw-thickness-range-label">Thickness</label>
                    <input type="range" id="addSignatureDrawThickness" min="1" max="5" step="1" defaultValue="1" data-l10n-id="pdfjs-editor-add-signature-draw-thickness-range" data-l10n-args="{ &quot;thickness&quot;: 1 }" tabIndex="0" title="Drawing thickness: ⁨1⁩" />
                  </div>
                </div>
              </div>
              <div id="addSignatureImageContainer" role="tabpanel" aria-labelledby="addSignatureImageButton" tabIndex="-1">
                <svg id="addSignatureImage" xmlns="http://www.w3.org/2000/svg" aria-labelledby="addSignatureImagePlaceholder"></svg>
                <div id="addSignatureImagePlaceholder">
                  <span data-l10n-id="pdfjs-editor-add-signature-image-placeholder">Drag a file here to upload</span>
                  <label id="addSignatureImageBrowse" htmlFor="addSignatureFilePicker" tabIndex="0">
                    <a data-l10n-id="pdfjs-editor-add-signature-image-browse-link">Or browse image files</a>
                  </label>
                  <input id="addSignatureFilePicker" type="file" accept="image/apng,image/avif,image/bmp,image/gif,image/jpeg,image/png,image/svg+xml,image/webp,image/x-icon" />
                </div>
              </div>
              <div id="addSignatureControls">
                <div id="horizontalContainer">
                  <div id="addSignatureDescriptionContainer">
                    <label htmlFor="addSignatureDescInput" data-l10n-id="pdfjs-editor-add-signature-description-label">Description (alt text)</label>
                    <span id="addSignatureDescription" className="inputWithClearButton">
                      <input id="addSignatureDescInput" type="text" data-l10n-id="pdfjs-editor-add-signature-description-input" tabIndex="0" title="Description (alt text)" disabled="" />
                      <button className="clearInputButton" type="button" tabIndex="0" aria-hidden="true" disabled=""></button>
                    </span>
                  </div>
                  <button id="clearSignatureButton" type="button" data-l10n-id="pdfjs-editor-add-signature-clear-button" tabIndex="0" title="Clear signature" disabled=""><span data-l10n-id="pdfjs-editor-add-signature-clear-button-label">Clear signature</span></button>
                </div>
                <div id="addSignatureSaveContainer">
                  <input type="checkbox" id="addSignatureSaveCheckbox" defaultChecked={true} disabled="" />
                  <label htmlFor="addSignatureSaveCheckbox" data-l10n-id="pdfjs-editor-add-signature-save-checkbox">Save signature</label>
                  <span></span>
                  <span id="addSignatureSaveWarning" data-l10n-id="pdfjs-editor-add-signature-save-warning-message">You’ve reached the limit of 5 saved signatures. Remove one to save more.</span>
                </div>
              </div>
              <div id="addSignatureError" hidden="" className="messageBar">
                <div>
                  <div>
                    <span className="title" data-l10n-id="pdfjs-editor-add-signature-image-upload-error-title">Couldn’t upload image</span>
                    <span className="description" data-l10n-id="pdfjs-editor-add-signature-image-upload-error-description">Check your network connection or try another image.</span>
                  </div>
                  <button id="addSignatureErrorCloseButton" className="closeButton" type="button" tabIndex="0"><span data-l10n-id="pdfjs-editor-add-signature-error-close-button">Close</span></button>
                </div>
              </div>
              <div className="dialogButtonsGroup">
                <button id="addSignatureCancelButton" type="button" className="secondaryButton" tabIndex="0"><span data-l10n-id="pdfjs-editor-add-signature-cancel-button">Cancel</span></button>
                <button id="addSignatureAddButton" type="button" className="primaryButton" disabled="" tabIndex="0"><span data-l10n-id="pdfjs-editor-add-signature-add-button">Add</span></button>
              </div>
            </div>
          </div>
        </dialog>
        <dialog className="dialog signatureDialog" id="editSignatureDescriptionDialog" aria-labelledby="editSignatureDescriptionTitle">
          <div id="editSignatureDescriptionContainer" className="mainContainer">
            <div className="title">
              <span id="editSignatureDescriptionTitle" role="sectionhead" data-l10n-id="pdfjs-editor-edit-signature-dialog-title">Edit description</span>
            </div>
            <div id="editSignatureDescriptionAndView">
              <div id="editSignatureDescriptionContainer">
                <label htmlFor="editSignatureDescInput" data-l10n-id="pdfjs-editor-add-signature-description-label">Description (alt text)</label>
                <span id="editSignatureDescription" className="inputWithClearButton">
                  <input id="editSignatureDescInput" type="text" data-l10n-id="pdfjs-editor-add-signature-description-input" title="Description (alt text)" />
                  <button className="clearInputButton" type="button" aria-hidden="true"></button>
                </span>
              </div>
              <svg id="editSignatureView" xmlns="http://www.w3.org/2000/svg" aria-label="asd" viewBox="2629 2582 6230 3301"></svg>
            </div>
            <div className="dialogButtonsGroup">
              <button id="editSignatureCancelButton" type="button" className="secondaryButton"><span data-l10n-id="pdfjs-editor-add-signature-cancel-button">Cancel</span></button>
              <button id="editSignatureUpdateButton" type="button" className="primaryButton" disabled=""><span data-l10n-id="pdfjs-editor-edit-signature-update-button">Update</span></button>
            </div>
          </div>
        </dialog>
        <div id="viewerContainer">
          <div id ="viewer" className="pdfViewer"></div>
        </div>
      </>
    )
  }

  
  return (
    <div className="edit_page">
      {pdfDocument ? <Application/> : <UploadPDF/>}
    </div>
  )
}