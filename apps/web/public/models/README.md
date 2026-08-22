# 3D Animal GLB Models Directory

Place your `.glb` 3D model files directly into this directory (`apps/web/public/models/`).

## Expected Filenames

| Character | Animal | Expected Filename | Insecurity / Situation |
| :--- | :--- | :--- | :--- |
| **Stardust** | Owl | `owl.glb` | Can't switch off the night before an exam |
| **Echo** | Deer | `deer.glb` | Replays every conversation afterward |
| **Cosmo** | Panda | `panda.glb` | Feels alone even in a full room |
| **Mochi** | Rabbit | `rabbit.glb` | Feels judged about how they look |
| **Haze** | Capybara | `capybara.glb` | Leaning on a habit more than they'd like |
| **Pebble** | Penguin | `penguin.glb` | Quietly struggling but won't say it |

## How it Works
- SafeSpeak will automatically look for `/models/<id>.glb` (e.g. `owl.glb`, `penguin.glb`, etc.).
- When a `.glb` file is detected, it will load, auto-center, scale, and render inside the 3D scene with idle breathing & hover animations.
- If a `.glb` file is missing for any character, SafeSpeak automatically falls back to the built-in procedural geometric 3D model without breaking.
