import { useState, useEffect } from "react";

export interface Enchant {
  id: string;
  level: number;
}

export function useLore() {
  const [name, setName] = useState("<gray>Item Name");
  const [lore, setLore] = useState<string[]>(["<gray>Item Lore"]);
  const [enchants, setEnchants] = useState<Enchant[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem("sdlore:name");
    const savedLore = localStorage.getItem("sdlore:lore");
    const savedEnchants = localStorage.getItem("sdlore:enchants");
    if (savedName) setName(savedName);
    if (savedLore) {
      try {
        setLore(JSON.parse(savedLore));
      } catch (e) {
        // ignore JSON parse errors
      }
    }
    if (savedEnchants) {
      try {
        setEnchants(JSON.parse(savedEnchants));
      } catch (e) {
        // ignore JSON parse errors
      }
    }
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem("sdlore:name", name);
    localStorage.setItem("sdlore:lore", JSON.stringify(lore));
    localStorage.setItem("sdlore:enchants", JSON.stringify(enchants));
  }, [name, lore, enchants]);

  const addLoreLine = () => setLore([...lore, ""]);

  const removeLoreLine = (index: number) => {
    setLore(lore.filter((_, i) => i !== index));
  };

  const updateLoreLine = (index: number, value: string) => {
    const newLore = [...lore];
    newLore[index] = value;
    setLore(newLore);
  };

  const setLoreBulk = (text: string) => {
    setLore(text.split("\n"));
  };

  const addEnchant = () => setEnchants([...enchants, { id: "", level: 1 }]);

  const removeEnchant = (index: number) => {
    setEnchants(enchants.filter((_, i) => i !== index));
  };

  const updateEnchant = (index: number, id: string, level: number) => {
    const newEnchants = [...enchants];
    newEnchants[index] = { id, level };
    setEnchants(newEnchants);
  };

  const clearEditor = () => {
    setName("");
    setLore([""]);
    setEnchants([]);
  };

  return {
    name,
    setName,
    lore,
    setLore,
    setLoreBulk,
    addLoreLine,
    removeLoreLine,
    updateLoreLine,
    enchants,
    setEnchants,
    addEnchant,
    removeEnchant,
    updateEnchant,
    clearEditor,
  };
}

