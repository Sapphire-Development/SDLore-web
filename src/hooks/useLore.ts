import { useState, useEffect, useRef } from "react";

export interface Enchant {
  id: string;
  level: number;
}

export interface LoreLine {
  id: string;
  value: string;
}

export interface EditorState {
  name: string;
  lore: LoreLine[];
  enchants: Enchant[];
}

export function useLore() {
  const [state, setState] = useState<EditorState>({
    name: "<gray>Item Name",
    lore: [{ id: crypto.randomUUID(), value: "<gray>Item Lore" }],
    enchants: [],
  });

  const [past, setPast] = useState<EditorState[]>([]);
  const [future, setFuture] = useState<EditorState[]>([]);
  const isUndoRedoAction = useRef(false);
  const isInitialLoad = useRef(true);

  // Load from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem("sdlore:name");
    const savedLore = localStorage.getItem("sdlore:lore");
    const savedEnchants = localStorage.getItem("sdlore:enchants");

    let initialLore: LoreLine[] = [{ id: crypto.randomUUID(), value: "<gray>Item Lore" }];
    let initialEnchants: Enchant[] = [];

    if (savedLore) {
      try {
        const parsed = JSON.parse(savedLore);
        if (Array.isArray(parsed)) {
          if (parsed.every((v): v is string => typeof v === "string")) {
            initialLore = parsed.map((v) => ({ id: crypto.randomUUID(), value: v }));
          } else if (parsed.every((v): v is LoreLine => typeof v?.id === "string" && typeof v?.value === "string")) {
            initialLore = parsed;
          }
        }
      } catch { /* corrupted data, use defaults */ }
    }
    if (savedEnchants) {
      try {
        const parsed = JSON.parse(savedEnchants);
        if (Array.isArray(parsed) && parsed.every((e): e is Enchant => typeof e?.id === "string" && typeof e?.level === "number")) {
          initialEnchants = parsed;
        }
      } catch { /* corrupted data, use defaults */ }
    }

    const initialState = {
      name: savedName || "<gray>Item Name",
      lore: initialLore,
      enchants: initialEnchants,
    };

    setState(initialState);
    setPast([initialState]);
    isInitialLoad.current = false;
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    if (isInitialLoad.current) return;
    localStorage.setItem("sdlore:name", state.name);
    localStorage.setItem("sdlore:lore", JSON.stringify(state.lore));
    localStorage.setItem("sdlore:enchants", JSON.stringify(state.enchants));
  }, [state]);

  // Handle history debounce
  useEffect(() => {
    if (isInitialLoad.current) return;

    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }

    const timer = setTimeout(() => {
      setPast((prevPast) => {
        const lastPast = prevPast[prevPast.length - 1];
        if (lastPast && JSON.stringify(lastPast) === JSON.stringify(state)) {
          return prevPast;
        }
        const newPast = [...prevPast, state];
        if (newPast.length > 50) newPast.shift();
        return newPast;
      });
      setFuture([]); // Clear future on new action
    }, 400);

    return () => clearTimeout(timer);
  }, [state]);

  const undo = () => {
    setPast((currentPast) => {
      let pastToUse = currentPast;
      const lastPast = currentPast[currentPast.length - 1];
      
      // Save current state if it hasn't been debounced yet
      if (lastPast && JSON.stringify(lastPast) !== JSON.stringify(state)) {
        pastToUse = [...currentPast, state];
      }

      if (pastToUse.length <= 1) return currentPast;

      const previousState = pastToUse[pastToUse.length - 2];
      const stateToUndo = pastToUse[pastToUse.length - 1];
      
      setFuture((f) => [stateToUndo, ...f]);
      isUndoRedoAction.current = true;
      setState(previousState);
      
      return pastToUse.slice(0, pastToUse.length - 1);
    });
  };

  const redo = () => {
    setFuture((currentFuture) => {
      if (currentFuture.length === 0) return currentFuture;
      
      const nextState = currentFuture[0];
      
      setPast((p) => [...p, nextState]);
      isUndoRedoAction.current = true;
      setState(nextState);
      
      return currentFuture.slice(1);
    });
  };

  const setName = (name: string) => setState(s => ({ ...s, name }));
  
  const setLoreBulk = (text: string) => setState(s => ({ 
    ...s, 
    lore: text.split("\n").map(value => ({ id: crypto.randomUUID(), value })) 
  }));
  
  const addLoreLine = () => setState(s => ({ 
    ...s, 
    lore: [...s.lore, { id: crypto.randomUUID(), value: "" }] 
  }));
  
  const removeLoreLine = (index: number) => setState(s => ({
    ...s,
    lore: s.lore.filter((_, i) => i !== index)
  }));
  
  const updateLoreLine = (index: number, value: string) => setState(s => {
    const newLore = [...s.lore];
    newLore[index] = { ...newLore[index], value };
    return { ...s, lore: newLore };
  });

  const reorderLoreLine = (oldIndex: number, newIndex: number) => setState(s => {
    const newLore = [...s.lore];
    const [removed] = newLore.splice(oldIndex, 1);
    newLore.splice(newIndex, 0, removed);
    return { ...s, lore: newLore };
  });

  const addEnchant = () => setState(s => ({
    ...s,
    enchants: [...s.enchants, { id: "", level: 1 }]
  }));

  const removeEnchant = (index: number) => setState(s => ({
    ...s,
    enchants: s.enchants.filter((_, i) => i !== index)
  }));

  const updateEnchant = (index: number, id: string, level: number) => setState(s => {
    const newEnchants = [...s.enchants];
    newEnchants[index] = { id, level };
    return { ...s, enchants: newEnchants };
  });

  const clearEditor = () => setState({
    name: "",
    lore: [{ id: crypto.randomUUID(), value: "" }],
    enchants: [],
  });

  return {
    name: state.name,
    setName,
    lore: state.lore,
    setLoreBulk,
    addLoreLine,
    removeLoreLine,
    updateLoreLine,
    reorderLoreLine,
    enchants: state.enchants,
    addEnchant,
    removeEnchant,
    updateEnchant,
    clearEditor,
    undo,
    redo,
    canUndo: past.length > 1 || (past.length > 0 && JSON.stringify(past[past.length - 1]) !== JSON.stringify(state)),
    canRedo: future.length > 0,
  };
}
