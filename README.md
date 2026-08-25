# ⏳ TimeReclaim — Own Your 24 Hours

> **"Riscopri il valore delle tue 24 ore: trasforma l'isolamento da scroll passivo sui social in tempo reale per la tua vita, le tue passioni e le tue relazioni."**

---

## 🎯 Strategia di Prodotto: Need, Obiettivo & Value Proposition

### 🔴 Need (Il Bisogno)
Molte persone trascorrono ore preziose ogni giorno in modo passivo sui social media (*doomer scrolling* su Instagram, TikTok, Reels), provando una costante sensazione di isolamento sociale, stanchezza mentale e frustrazione per non riuscire a coltivare i propri hobby, la forma fisica, le relazioni reali o semplicemente per non avere tempo libero da dedicare a se stessi senza senso di colpa.

### 🎯 Obiettivo
Fornire uno strumento chiaro, visivo e motivante per **mappare le 24 ore quotidiane**, identificare ed eliminare le "fughe di tempo" (social network e distrazioni digitali) e sbloccare un **"Budget di Tempo Intenzionale"** distribuito tra attività produttive, ludiche, relazionali e di rigenerazione mentale.

### 💎 Value Proposition
> *"Riscopri il valore delle tue 24 ore: trasforma l'isolamento da scroll passivo in tempo reale per la tua vita, le tue passioni e le tue relazioni."*

---

## 💡 Intenti degli Utenti (User Intents & User Stories)

1. **Mappatura Routine Iniziale**: Definire le ore di sonno e veglia per avere la matrice base delle ore di veglia (es. 16 ore sveglio su 24).
2. **Blocco Impegni Non Negoziabili**: Inserire i blocchi di attività fisse e obbligatorie (lavoro, studio, commuto, faccende domestiche) per scoprire il "Tempo Grezzo Rimanente".
3. **Diagnosi & Taglio Social Media**: Calcolare l'impatto reale delle ore spese sui social network per prendere consapevolezza di quanto tempo sottraggono alla vita ed alle relazioni reali.
4. **Allocazione Intenzionale**: Distribuire il tempo recuperato tra attività a scelta (Allenamento, Cinema/Serie TV, Apprendimento/Lettura, Socializzazione Reale, Riposo/Noia rigenerante).
5. **Monitoraggio Equilibrio (Productive vs. Restorative)**: Visualizzare il bilanciamento tra attività produttive e non-produttive (inclusa la noia/relax) per godersi il tempo libero senza sensi di colpa.
6. **Profilo & Autenticazione (Supabase Auth)**: Registrazione con Nome, Cognome, Email e Password, login sicuro e recupero password via mail con persistenza cloud su PostgreSQL.

---

## 🎨 Design System: Liquid Glass (Glassmorphism 2.0)
- **Sfondo Dynamic Fluid**: Sfondo scuro elegante (*Midnight Obsidian*) con sfere di colore sfumato in movimento lento (*Aurora Mesh Gradient*).
- **Vetri Liquidi (`Liquid Glass Cards`)**: `backdrop-filter: blur(24px) saturate(190%)` con sfondi traslucidi e bordi luminescenti.
- **Tipografia Modernista**: Google Fonts (*Outfit* e *Plus Jakarta Sans*).

---

## 🛠️ Stack Tecnologico
- **Frontend**: HTML5, Vanilla CSS3 (Custom Properties per l'estetica Liquid Glass) e JavaScript ES6+.
- **Database & Auth**: Supabase (PostgreSQL, Auth, RLS, Trigger).
- **Deployment**: Vercel & GitHub.

---

## 🚀 Guida Rapida alla Configurazione DB Supabase
1. Accedi al tuo progetto su [Supabase](https://supabase.com).
2. Apri l'**SQL Editor**.
3. Copia ed incolla il contenuto del file [`supabase-schema.sql`](./supabase-schema.sql) ed eseguilo.
4. Avvia la web app ed inserisci l'URL ed la Anon Key nel modal Profilo o accedi direttamente con la tua email!