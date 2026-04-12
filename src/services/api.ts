export interface GenerateLorePayload {
  name: string;
  lore: string[];
  enchants?: { id: string; level: number }[];
}

export interface GenerateLoreResponse {
  code: string;
}

export async function generateLoreCode(payload: GenerateLorePayload): Promise<string> {
  const apiUrl = import.meta.env.PUBLIC_API_URL || "";
  const response = await fetch(`${apiUrl}/api/lore`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error("API Error detailed:", errorData);
    
    let errorMessage = "Failed to generate code";
    if (errorData?.details && Array.isArray(errorData.details) && errorData.details.length > 0) {
      errorMessage = errorData.details.map((d: any) => d.message).join(", ");
    } else if (errorData?.error) {
      errorMessage = errorData.error;
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json() as GenerateLoreResponse;
  
  if (!data.code) {
    throw new Error("Invalid response format");
  }

  return data.code;
}
