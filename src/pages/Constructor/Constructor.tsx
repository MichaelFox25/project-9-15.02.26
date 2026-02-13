import React, { useEffect, useRef, useState, useReducer } from "react";
import { HexColorPicker } from "react-colorful";
import { Canvas, Rect, FabricImage, Textbox, FabricObject } from "fabric";
import "./Constructor.css";
import I1 from "./images/img1.png";
import I2 from "./images/img2.png";
import I3 from "./images/img4.png";

type ConstructoProps = {
  onGoBack: () => void;
};

function CaseConstructor({ onGoBack }: ConstructoProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const caseRef = useRef<Rect | null>(null);
  const [activeTool, setActiveTool] = useState<"text" | "image" | "case">("text");
  const [selected, setSelected] = useState<FabricObject | null>(null);
  const [caseColor, setCaseColor] = useState("#ffffff");
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const DEFAULT_TEXT = "Ваш текст";
  const DEFAULT_FONT_SIZE = 14;
  const DEFAULT_TEXT_COLOR = "#000000";
  const DEFAULT_FONT_FAMILY = "Arial";
  const [designName, setDesignName] = useState<string>("");

  useEffect(() => {
    if (!canvasRef.current) return;
    const container = canvasRef.current.parentElement;
    const width = container?.clientWidth ?? 600;
    const height = container?.clientHeight ?? 400;
    const canvas = new Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: "white",
      selection: true,
      preserveObjectStacking: true,
    });
    fabricRef.current = canvas;
    const createCase = () => {
      if (!canvas) return null;
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      const caseShape = new Rect({
        width: canvasWidth,
        height: canvasHeight,
        rx: 40,
        ry: 40,
        fill: caseColor,
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        selectable: false,
        evented: false,
        id: "case-background",
      });
      return caseShape;
    };
    const initialCase = createCase();
    if (initialCase) {
      canvas.add(initialCase);
      canvas.sendObjectToBack(initialCase);
      caseRef.current = initialCase;
    }
    const updateSelected = () => {
      const obj = canvas.getActiveObject();
      setSelected(obj);
      forceUpdate();
    };

    canvas.on("selection:created", updateSelected);
    canvas.on("selection:updated", updateSelected);
    canvas.on("selection:cleared", () => {
      setSelected(null);
      forceUpdate();
    });
    canvas.on("object:modified", updateSelected);
    canvas.on("object:scaling", updateSelected);
    canvas.on("object:moving", updateSelected);
    canvas.on("object:rotating", updateSelected);
    const handleResize = () => {
      if (!canvasRef.current || !fabricRef.current) return;
      const container = canvasRef.current.parentElement;
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      fabricRef.current.setDimensions({ width: newWidth, height: newHeight }); 
      if (caseRef.current) {
        fabricRef.current.remove(caseRef.current);
      }
      const newCase = createCase();
      if (newCase) {
        fabricRef.current.add(newCase);
        fabricRef.current.sendObjectToBack(newCase);
        caseRef.current = newCase;
      }
      fabricRef.current.renderAll(); 
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.dispose(); 
    };
  }, []); 
  useEffect(() => {
    if (caseRef.current) {
      caseRef.current.set("fill", caseColor); 
      fabricRef.current?.renderAll(); 
    }
  }, [caseColor]); 
  const addText = () => {
    const canvas = fabricRef.current;
    const caseObj = caseRef.current;
    if (!canvas || !caseObj) return;
    const text = new Textbox(DEFAULT_TEXT, {
      fontSize: DEFAULT_FONT_SIZE,
      fill: DEFAULT_TEXT_COLOR,
      fontFamily: DEFAULT_FONT_FAMILY,
      editable: true, 
    });
    const caseCenterX = caseObj.width! / 2;
    const caseCenterY = caseObj.height! / 2;
    text.left = caseCenterX - (text.width! * text.scaleX!);
    text.top = caseCenterY - (text.height! * text.scaleY!);
    canvas.add(text); 
    canvas.setActiveObject(text); 
    setSelected(text);
    forceUpdate();
    canvas.renderAll();
  };
  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; 
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const url = reader.result as string;
      try {
        const img = await FabricImage.fromURL(url, {
          crossOrigin: "anonymous", 
        });
        const canvas = fabricRef.current;
        const caseObj = caseRef.current;
        if (!canvas || !caseObj) return;
        const caseWidth = caseObj.width!;
        const caseHeight = caseObj.height!;
        const imgWidth = img.width ?? 1;
        const imgHeight = img.height ?? 1;
        img.set({
          scaleX: caseWidth / imgWidth, 
          scaleY: caseHeight / imgHeight, 
          left: caseObj.left, 
          top: caseObj.top, 
        });
        canvas.add(img); 
        canvas.sendObjectToBack(caseRef.current!); 
        canvas.setActiveObject(img); 
        setSelected(img);
        forceUpdate();
        canvas.renderAll();
      } catch (error) {
        console.error("Image loading failed:", error);
      }
    };
    reader.readAsDataURL(file); 
  };
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  const updateObject = (key: string, value: any) => {
    if (!selected) return;
    selected.set(key as any, value); 
    fabricRef.current?.renderAll(); 
    forceUpdate();
  };

  const getSettingsTitle = () => {
    if (!selected) return "НАСТРОЙКИ";
    if (selected.type === "textbox") return "НАСТРОЙКИ ТЕКСТА";
    if (selected.type === "image") return "НАСТРОЙКИ ИЗОБРАЖЕНИЯ";
    return "НАСТРОЙКИ ОБЪЕКТА";
  };
  const ColorPicker = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <div className="color-picker">
      <HexColorPicker color={value} onChange={onChange} />
      <div className="color-value">{value}</div>
    </div>
  );
  const handleSaveDesign = async () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const dataURL = canvas.toDataURL({
      format: "png",
      multiplier: 1,
    });
    try {
      const formData = new FormData();
      formData.append('product_id', '1');
      formData.append('name', designName);
      formData.append('background_color', caseColor);
      const blob = await (await fetch(dataURL)).blob();
      const file = new File([blob], 'design.png', { type: 'image/png' });
      formData.append('photo', file, 'design.png');

      const response = await fetch(
        'https://api.vyatsu-junior.ru/design/dev-add',
        {
          method: 'POST',
          credentials: 'include', 
          body: formData
        }
      );
      if (response.ok) {
        console.log('Design saved successfully!');
      } else if (response.status === 401 || response.status === 403) {
        console.log('Unauthorized, attempting to refresh token...');
      } else {
        console.error('Failed to save design.');
        onGoBack(); 
      }
    } catch (error) {
      console.error('Error saving design:', error);
    }
  };

  return (
    <div className="case-constructor">
      <main className="main-layout">
        <div className="canvas-container">
          <canvas ref={canvasRef} className="canvas" />
        </div>
        <div className="settings-panel">
          <h2 className="settings-title">{getSettingsTitle()}</h2>
          {selected && selected.type !== "textbox" && (
            <div className="properties-section">
              <div className="property-row">
                <label>X</label>
                <input
                  type="number"
                  value={Math.round(selected.left ?? 0)}
                  onChange={(e) => updateObject("left", Number(e.target.value))}
                  className="property-input1"
                />
                <label>Y</label>
                <input
                  type="number"
                  value={Math.round(selected.top ?? 0)}
                  onChange={(e) => updateObject("top", Number(e.target.value))}
                  className="property-input1"
                />
              </div>
              <div className="property-row">
                <label>W</label>
                <input
                  type="number"
                  value={Math.round((selected.width ?? 0) * (selected.scaleX ?? 1))}
                  onChange={(e) => {
                    const newScaleX = Number(e.target.value) / (selected.width ?? 1);
                    updateObject("scaleX", newScaleX);
                  }}
                  className="property-input1"
                />
                <label>H</label>
                <input
                  type="number"
                  value={Math.round((selected.height ?? 0) * (selected.scaleY ?? 1))}
                  onChange={(e) => {
                    const newScaleY = Number(e.target.value) / (selected.height ?? 1);
                    updateObject("scaleY", newScaleY);
                  }}
                  className="property-input1"
                />
              </div>
              <div className="property-row">
                <label>Поворот</label>
                <input
                  type="number"
                  value={selected.angle ?? 0}
                  onChange={(e) => updateObject("angle", Number(e.target.value))}
                  className="property-input1"
                />
              </div>
            </div>
          )}
          {selected?.type === "textbox" && (
            <div className="text-controls">
              <div className="property-row">
                <label>Шрифт</label>
                <select
                  value={(selected as Textbox).fontFamily || DEFAULT_FONT_FAMILY}
                  onChange={(e) => updateObject("fontFamily", e.target.value)}
                  className="property-select1">
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Courier New">Courier New</option>
                </select>
              </div>
              <div className="property-row">
                <label>Размер шрифта</label>
                <input
                  type="number"
                  value={(selected as Textbox).fontSize || DEFAULT_FONT_SIZE}
                  onChange={(e) => updateObject("fontSize", Number(e.target.value))}
                  className="property-input1"
                />
              </div>
            </div>
          )}
          {activeTool === "text" && (
            <div className="tool-panel">
              <p className="tool-description">
                Нажмите «Добавить текст» — он появится по центру чехла.
              </p>
              <button onClick={addText} className="action-button">
                Добавить текст
              </button>
            </div>
          )}
          {activeTool === "image" && (
            <div className="tool-panel">
              <label>Загрузить изображение</label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={uploadImage}
                className="hidden" 
              />
              <button onClick={triggerFileUpload} className="action-button">
                Выбрать файл
              </button>
            </div>
          )}
          {activeTool === "case" && (
            <div className="tool-panel">
              <label>Цвет чехла</label>
              <ColorPicker value={caseColor} onChange={setCaseColor} />
            </div>
          )}
          <div className="property-row">
            <label>Название дизайна</label>
            <input
              type="text"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              className="property-input2"
              placeholder="Введите название"
            />
          </div>
        </div>
        <div>
          <button className="backbut" onClick={onGoBack}>На главную</button>
        </div>
        <div>
          <button className="savebut" onClick={handleSaveDesign}>Сохранить</button>
        </div>
      </main>
      <footer className="toolbar">
        <button
          onClick={() => {
            setActiveTool("image");
            triggerFileUpload(); 
          }}
          className={`tool-button ${activeTool === "image" ? "active" : ""}`}
        >
          <img src={I1} width={35} height={35} alt="Image tool"/>
        </button>
        <button
          onClick={() => setActiveTool("text")}
          className={`tool-button ${activeTool === "text" ? "active" : ""}`}
        >
          <img src={I2} width={35} height={35} alt="Text tool"/>
        </button>
        <button
          onClick={() => setActiveTool("case")}
          className={`tool-button ${activeTool === "case" ? "active" : ""}`}
        >
          <img src={I3} width={35} height={35} alt="Case color tool"/>
        </button>
      </footer>
    </div>
  );
}

export default CaseConstructor;