/*
Github: https://github.com/la-voliere/react-mask-editor
LICENSE: MIT
 */
import * as React from "react";
import "./maskEditor.scss";
import { Button } from "antd";
import {
  UndoOutlined,
  HighlightOutlined,
  ExpandOutlined,
  NodeIndexOutlined,
} from "@ant-design/icons"; // Import icons

export interface MaskEditorProps {
  src: string;
  canvasRef?: React.MutableRefObject<HTMLCanvasElement>;
  cursorSize?: number;
  onCursorSizeChange?: (size: number) => void;
  // maskOpacity?: number; // Removed maskOpacity
  maskColor?: string;
  boxSize: { x: number; y: number };
  maskBlendMode?:
    | "normal"
    | "multiply"
    | "screen"
    | "overlay"
    | "darken"
    | "lighten"
    | "color-dodge"
    | "color-burn"
    | "hard-light"
    | "soft-light"
    | "difference"
    | "exclusion"
    | "hue"
    | "saturation"
    | "color"
    | "luminosity";
}

export const MaskEditorDefaults = {
  cursorSize: 10,
  // maskOpacity: 0.75, // Removed maskOpacity default
  maskColor: "#0021ff", // Keep maskColor for cursor, maybe future use
  maskBlendMode: "normal",
};

// Define the drawing color with desired opacity
const drawingColor = "rgb(0,45,255)";

export const MaskEditor: React.FC<MaskEditorProps> = (
  props: MaskEditorProps,
) => {
  const src = props.src;
  const cursorSize = props.cursorSize ?? MaskEditorDefaults.cursorSize;
  const maskColor = props.maskColor ?? MaskEditorDefaults.maskColor; // Still used for cursor
  const maskBlendMode = props.maskBlendMode ?? MaskEditorDefaults.maskBlendMode;
  // const maskOpacity = props.maskOpacity ?? MaskEditorDefaults.maskOpacity; // Removed maskOpacity usage

  const canvas = React.useRef<HTMLCanvasElement | null>(null);
  const maskCanvas = React.useRef<HTMLCanvasElement | null>(null);
  const cursorCanvas = React.useRef<HTMLCanvasElement | null>(null);
  const [context, setContext] = React.useState<CanvasRenderingContext2D | null>(
    null,
  );
  const [maskContext, setMaskContext] =
    React.useState<CanvasRenderingContext2D | null>(null);
  const [cursorContext, setCursorContext] =
    React.useState<CanvasRenderingContext2D | null>(null);
  // 'size' will store the original image dimensions
  const [size, setSize] = React.useState<{ x: number; y: number }>({
    x: 0, // Initialize with 0 or a sensible default
    y: 0,
  });
  // 'displaySize' will store the dimensions for display (from boxSize)
  const [displaySize, setDisplaySize] = React.useState<{
    x: number;
    y: number;
  }>({
    x: props.boxSize.x,
    y: props.boxSize.y,
  });
  const [history, setHistory] = React.useState<ImageData[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] =
    React.useState<number>(-1);
  const [drawingMode, setDrawingMode] = React.useState<
    "brush" | "rectangle" | "lasso"
  >("rectangle"); // Default to rectangle
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [startPos, setStartPos] = React.useState<{
    x: number;
    y: number;
  } | null>(null); // Stores scaled coordinates
  const [lassoPoints, setLassoPoints] = React.useState<
    { x: number; y: number }[]
  >([]); // Stores scaled coordinates

  // Update displaySize when boxSize prop changes
  React.useEffect(() => {
    setDisplaySize({ x: props.boxSize.x, y: props.boxSize.y });
  }, [props.boxSize]);

  // Function to save current state to history
  const saveHistory = React.useCallback(() => {
    if (!maskContext || !maskCanvas.current) return;
    // Use actual canvas dimensions (original image size) for getImageData
    const imageData = maskContext.getImageData(
      0,
      0,
      size.x, // Use original image width
      size.y, // Use original image height
    );
    // If we undo, then draw something new, we should discard the future history
    const newHistory = history.slice(0, currentHistoryIndex + 1);
    setHistory([...newHistory, imageData]);
    setCurrentHistoryIndex(newHistory.length);
  }, [maskContext, history, currentHistoryIndex, size]); // Add size dependency

  // Function to handle undo
  const handleUndo = () => {
    if (currentHistoryIndex <= 0) return; // Nothing to undo or only initial state left
    const prevIndex = currentHistoryIndex - 1;
    const imageData = history[prevIndex];
    if (maskContext && imageData) {
      // Use actual canvas dimensions for putImageData
      maskContext.putImageData(imageData, 0, 0);
      setCurrentHistoryIndex(prevIndex);
    }
  };

  // Initialize history with the initial blank state
  React.useEffect(() => {
    // Ensure size is set before saving initial history
    if (
      maskContext &&
      maskCanvas.current &&
      history.length === 0 &&
      size.x > 0 &&
      size.y > 0
    ) {
      saveHistory(); // Save initial transparent state
    }
  }, [maskContext, saveHistory, history.length, size]); // Add size dependency

  React.useLayoutEffect(() => {
    if (canvas.current && !context) {
      const ctx = (canvas.current as HTMLCanvasElement).getContext("2d");
      setContext(ctx);
    }
  }, [canvas]);

  React.useLayoutEffect(() => {
    // Initialize mask canvas context
    if (maskCanvas.current && !maskContext) {
      const ctx = (maskCanvas.current as HTMLCanvasElement).getContext("2d");
      // No initial fill here either, default is transparent
      setMaskContext(ctx);
    }
  }, [maskCanvas]);

  React.useLayoutEffect(() => {
    if (cursorCanvas.current && !context) {
      const ctx = (cursorCanvas.current as HTMLCanvasElement).getContext("2d");
      setCursorContext(ctx);
    }
  }, [cursorCanvas]);

  const [image, setImage] = React.useState<HTMLImageElement>();
  React.useEffect(() => {
    const img = new Image();
    img.onload = (evt) => {
      const canvasWidth = displaySize.x; // Use displaySize for drawing calculations
      const canvasHeight = displaySize.y;

      const imgWidth = img.width;
      const imgHeight = img.height;

      // Store the original image size
      setSize({ x: imgWidth, y: imgHeight });

      // Calculate scaling to fit the display canvas
      const ratio = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
      const newWidth = imgWidth * ratio;
      const newHeight = imgHeight * ratio;
      const x = (canvasWidth - newWidth) / 2;
      const y = (canvasHeight - newHeight) / 2;

      // Draw base image onto the base canvas (scaled)
      context?.clearRect(0, 0, canvasWidth, canvasHeight);
      context?.drawImage(img, x, y, newWidth, newHeight);
    };
    img.onerror = () => {
      console.error("Failed to load image:", src);
      // Optionally handle image loading error, e.g., show a placeholder
    };
    img.src = src;
    setImage(img);
  }, [src, context, displaySize]); // Depend on displaySize

  // Pass mask canvas up
  React.useLayoutEffect(() => {
    if (props.canvasRef && maskCanvas.current) {
      props.canvasRef.current = maskCanvas.current;
    }
  }, [maskCanvas, props.canvasRef]);

  // Update cursor display logic (uses display coordinates)
  const updateCursor = (evt: MouseEvent | WheelEvent) => {
    if (!cursorContext || !cursorCanvas.current) return;
    const rect = cursorCanvas.current.getBoundingClientRect();
    // Get coordinates relative to the *display* canvas
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;

    cursorContext.clearRect(
      0,
      0,
      displaySize.x, // Use displaySize for cursor canvas
      displaySize.y,
    );

    if (drawingMode === "brush") {
      cursorContext.beginPath();
      cursorContext.fillStyle = `${maskColor}88`;
      cursorContext.strokeStyle = maskColor;
      // Draw cursor circle based on display coordinates and size
      cursorContext.arc(x, y, cursorSize, 0, 2 * Math.PI);
      cursorContext.fill();
      cursorContext.stroke();
    } else {
      // Rectangle and Lasso use crosshair
      cursorContext.strokeStyle = maskColor;
      cursorContext.lineWidth = 1;
      cursorContext.beginPath();
      cursorContext.moveTo(x - 10, y);
      cursorContext.lineTo(x + 10, y);
      cursorContext.moveTo(x, y - 10);
      cursorContext.lineTo(x, y + 10);
      cursorContext.stroke();
    }
  };

  // Combined Mouse Event Listener
  React.useEffect(() => {
    const canvasEl = cursorCanvas.current;
    // Ensure contexts and original size are ready
    if (!canvasEl || !maskContext || !cursorContext || !size.x || !size.y)
      return;

    const scaleX = size.x / displaySize.x;
    const scaleY = size.y / displaySize.y;

    // Gets mouse position relative to display canvas and scales it for mask canvas
    const getScaledMousePos = (evt: MouseEvent) => {
      const rect = canvasEl.getBoundingClientRect();
      const displayX = evt.clientX - rect.left;
      const displayY = evt.clientY - rect.top;
      return {
        x: displayX * scaleX,
        y: displayY * scaleY,
      };
    };

    const handleMouseDown = (evt: MouseEvent) => {
      if (evt.button !== 0) return; // Only handle left click for drawing
      setIsDrawing(true);
      const pos = getScaledMousePos(evt); // Get scaled position for drawing
      setStartPos(pos);

      maskContext.save(); // Save context state
      if (evt.shiftKey) {
        // Erasing
        maskContext.globalCompositeOperation = "destination-out";
      } else {
        // Drawing
        maskContext.fillStyle = maskColor; // Use defined drawing color
        maskContext.globalCompositeOperation = "source-over";
      }

      if (drawingMode === "brush") {
        maskContext.beginPath();
        // Use scaled coordinates and scaled cursor size for drawing on maskCanvas
        maskContext.arc(pos.x, pos.y, cursorSize * scaleX, 0, 2 * Math.PI); // Scale cursorSize approx.
        maskContext.fill();
      } else if (drawingMode === "lasso") {
        setLassoPoints([pos]); // Start lasso path with scaled points
      }
      // Rectangle drawing starts on mouse move/up
      maskContext.restore(); // Restore context state
    };

    const handleMouseMove = (evt: MouseEvent) => {
      const currentDisplayPos = {
        // Position relative to display canvas for cursor update
        x: evt.clientX - canvasEl.getBoundingClientRect().left,
        y: evt.clientY - canvasEl.getBoundingClientRect().top,
      };
      updateCursor(evt); // Update cursor appearance based on display coordinates

      if (!isDrawing || !startPos) return;

      const currentScaledPos = getScaledMousePos(evt); // Get scaled position for drawing

      maskContext.save(); // Save context state
      if (evt.shiftKey) {
        maskContext.globalCompositeOperation = "destination-out";
      } else {
        maskContext.fillStyle = maskColor;
        maskContext.globalCompositeOperation = "source-over";
      }

      if (drawingMode === "brush") {
        maskContext.beginPath();
        // Use scaled coordinates and scaled cursor size
        maskContext.arc(
          currentScaledPos.x,
          currentScaledPos.y,
          cursorSize * scaleX,
          0,
          2 * Math.PI,
        );
        maskContext.fill();
      } else if (drawingMode === "rectangle") {
        // Draw temporary rectangle preview on cursor canvas (using display coordinates)
        cursorContext.clearRect(0, 0, displaySize.x, displaySize.y);
        updateCursor(evt); // Redraw cursor
        cursorContext.fillStyle = `${maskColor}33`; // Semi-transparent fill
        cursorContext.strokeStyle = maskColor;
        cursorContext.lineWidth = 1;
        const startDisplayPos = {
          x: startPos.x / scaleX,
          y: startPos.y / scaleY,
        }; // Convert startPos back to display coords
        cursorContext.strokeRect(
          startDisplayPos.x,
          startDisplayPos.y,
          currentDisplayPos.x - startDisplayPos.x,
          currentDisplayPos.y - startDisplayPos.y,
        );
        cursorContext.fillRect(
          startDisplayPos.x,
          startDisplayPos.y,
          currentDisplayPos.x - startDisplayPos.x,
          currentDisplayPos.y - startDisplayPos.y,
        );
      } else if (drawingMode === "lasso") {
        // Add scaled point to lasso path
        const updatedLassoPoints = [...lassoPoints, currentScaledPos];
        setLassoPoints(updatedLassoPoints);

        // Draw temporary lasso preview on cursor canvas (using display coordinates)
        cursorContext.clearRect(0, 0, displaySize.x, displaySize.y);
        updateCursor(evt); // Redraw cursor

        const startDisplayPos = {
          x: startPos.x / scaleX,
          y: startPos.y / scaleY,
        }; // Convert startPos back
        const displayPoints = updatedLassoPoints.map((p) => ({
          x: p.x / scaleX,
          y: p.y / scaleY,
        }));

        if (displayPoints.length > 1) {
          cursorContext.beginPath();
          cursorContext.moveTo(startDisplayPos.x, startDisplayPos.y);
          displayPoints.forEach((point) =>
            cursorContext.lineTo(point.x, point.y),
          );
          cursorContext.fillStyle = `${maskColor}33`; // Semi-transparent fill
          cursorContext.fill();
          cursorContext.strokeStyle = maskColor;
          cursorContext.lineWidth = 1;
          cursorContext.stroke(); // Draw outline as well
        }
      }
      maskContext.restore(); // Restore context state
    };

    const handleMouseUp = (evt: MouseEvent) => {
      if (!isDrawing || !startPos) return;
      const endScaledPos = getScaledMousePos(evt); // Get scaled end position

      // Clear preview on cursor canvas and redraw cursor
      cursorContext.clearRect(0, 0, displaySize.x, displaySize.y);
      updateCursor(evt);

      // Use scaled coordinates for final drawing on maskCanvas
      maskContext.save();
      if (evt.shiftKey) {
        maskContext.globalCompositeOperation = "destination-out";
        // For erasing, fillStyle doesn't matter as much, but setting it avoids potential issues
        maskContext.fillStyle = "#ffffff"; // Or any opaque color
      } else {
        maskContext.globalCompositeOperation = "source-over";
        maskContext.fillStyle = maskColor; // Use the semi-transparent drawing color
      }

      if (drawingMode === "rectangle") {
        maskContext.fillRect(
          startPos.x,
          startPos.y,
          endScaledPos.x - startPos.x,
          endScaledPos.y - startPos.y,
        );
        saveHistory(); // Save state after drawing rectangle
      } else if (drawingMode === "brush") {
        // Brush strokes are drawn continuously on mouse move
        saveHistory(); // Save state after finishing brush stroke
      } else if (drawingMode === "lasso") {
        if (lassoPoints.length > 1) {
          maskContext.beginPath();
          maskContext.moveTo(startPos.x, startPos.y);
          lassoPoints.forEach((point) => maskContext.lineTo(point.x, point.y));
          // Add the final point explicitly if needed, though mouseMove usually adds it
          // maskContext.lineTo(endScaledPos.x, endScaledPos.y);
          maskContext.closePath(); // Close the path back to the start point
          maskContext.fill();
          saveHistory(); // Save state after drawing lasso
        }
        setLassoPoints([]); // Clear lasso points
      }

      maskContext.restore();
      setIsDrawing(false);
      setStartPos(null);
    };

    const handleMouseLeave = (evt: MouseEvent) => {
      cursorContext.clearRect(0, 0, displaySize.x, displaySize.y);
      // Optional: Treat leaving canvas as mouse up if drawing
      // if (isDrawing) {
      //     handleMouseUp(evt);
      // }
    };

    // Wheel listener for brush size (operates on display size)
    const handleWheel = (evt: WheelEvent) => {
      if (drawingMode === "brush" && props.onCursorSizeChange) {
        evt.preventDefault();
        evt.stopPropagation();
        // Adjust cursorSize based on display interaction
        const newSize = Math.max(1, cursorSize + (evt.deltaY > 0 ? -1 : 1));
        props.onCursorSizeChange(newSize);
        updateCursor(evt); // Update cursor size display (uses display coordinates)
      }
    };

    canvasEl.addEventListener("mousedown", handleMouseDown);
    canvasEl.addEventListener("mousemove", handleMouseMove);
    canvasEl.addEventListener("mouseup", handleMouseUp);
    canvasEl.addEventListener("mouseleave", handleMouseLeave);
    canvasEl.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      canvasEl.removeEventListener("mousedown", handleMouseDown);
      canvasEl.removeEventListener("mousemove", handleMouseMove);
      canvasEl.removeEventListener("mouseup", handleMouseUp);
      canvasEl.removeEventListener("mouseleave", handleMouseLeave);
      canvasEl.removeEventListener("wheel", handleWheel);
    };
  }, [
    cursorContext,
    maskContext,
    cursorCanvas,
    cursorSize,
    maskColor,
    size, // Depend on original image size
    displaySize, // Depend on display size
    props.onCursorSizeChange,
    drawingMode,
    isDrawing,
    startPos,
    saveHistory,
    updateCursor, // updateCursor itself doesn't need scaling logic internally
    lassoPoints,
    drawingColor, // Added drawingColor dependency
  ]);

  // Remove old useEffect for listeners
  // React.useEffect(() => { ... }, [...]);

  // Remove replaceMaskColor and its useEffect, as color is applied directly during drawing
  // const replaceMaskColor = React.useCallback(...);
  // React.useEffect(() => replaceMaskColor(maskColor, false), [maskColor]);

  const useSize = props.boxSize; // Always use props.boxSize

  return (
    <div className="ract-mask-container">
      <div className="ract-mask-container-buttons">
        <Button
          icon={<UndoOutlined />} // Add icon
          onClick={handleUndo}
          disabled={currentHistoryIndex <= 0} // Disable if nothing to undo
          className="ract-mask-container-button"
          shape={"circle"}
        ></Button>

        {/* Add Brush Button */}
        <Button
          icon={<HighlightOutlined />} // Example icon
          onClick={() => setDrawingMode("brush")}
          type={drawingMode === "brush" ? "primary" : "default"} // Highlight active mode
          className="ract-mask-container-button"
          shape={"circle"}
        ></Button>

        <Button
          icon={<ExpandOutlined />} // Add icon
          onClick={() => setDrawingMode("rectangle")}
          type={drawingMode === "rectangle" ? "primary" : "default"} // Highlight active mode
          className="ract-mask-container-button"
          shape={"circle"}
        ></Button>

        <Button
          icon={<NodeIndexOutlined />} // Add appropriate icon later
          onClick={() => setDrawingMode("lasso")}
          type={drawingMode === "lasso" ? "primary" : "default"} // Highlight active mode
          className="ract-mask-container-button"
          shape={"circle"}
        ></Button>
      </div>
      {/* ... rest of the component ... */}
      <div className="react-mask-editor-outer">
        {/* ... existing canvas elements ... */}
        {/* Ensure canvas dimensions use useSize */}
        <div
          className="react-mask-editor-inner"
          style={{
            width: useSize.x,
            height: useSize.y,
          }}
        >
          {/* Base canvas shows scaled image */}
          <canvas
            ref={canvas}
            style={{
              width: useSize.x,
              height: useSize.y,
            }}
            width={useSize.x} // Resolution matches display
            height={useSize.y}
            className="react-mask-editor-base-canvas"
          />
          {/* Mask canvas has original resolution but displays scaled */}
          <canvas
            ref={maskCanvas}
            width={size.x} // Actual resolution = original image width
            height={size.y} // Actual resolution = original image height
            style={{
              width: useSize.x, // Display width matches container
              height: useSize.y, // Display height matches container
              opacity: 0.3, // Keep visual styling
              mixBlendMode: maskBlendMode as any,
            }}
            className="react-mask-editor-mask-canvas"
          />
          {/* Cursor canvas matches display size */}
          <canvas
            ref={cursorCanvas}
            width={useSize.x} // Resolution matches display
            height={useSize.y}
            style={{
              width: useSize.x,
              height: useSize.y,
            }}
            className="react-mask-editor-cursor-canvas"
          />
        </div>
      </div>
    </div>
  );
};
