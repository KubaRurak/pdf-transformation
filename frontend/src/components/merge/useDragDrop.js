import { useState, useRef} from 'react';

export function useDragDrop(handleUpload) {

    const [dragging, setDragging] = useState(false);
    const dragCounter = useRef(0);

    const handleDrop = (event) => {
        event.preventDefault();
        setDragging(false);
        dragCounter.current = 0; 
        if (event.dataTransfer.items) {
            const files = [];
            for (let i = 0; i < event.dataTransfer.items.length; i++) {
                if (event.dataTransfer.items[i].kind === 'file') {
                    files.push(event.dataTransfer.items[i].getAsFile());
                }
            }
            handleUpload(files); // Use the provided uploadFiles function
        }
        setDragging(false);
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        dragCounter.current++;
        console.log(dragCounter.current);
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setDragging(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        dragCounter.current--;
        console.log(dragCounter.current);
        if (dragCounter.current === 0) {
            setDragging(false);
        }
    };



    return { dragging, handleDrop, handleDragEnter, handleDragLeave };
}