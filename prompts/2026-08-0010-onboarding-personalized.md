[-]

[✨🫕] Personalize "Co hoří?" for the company

- Add a simple onboarding wizard.
- The application should ask questions about the company and use the answers to decide which items from the template are relevant.
- Ask questions such as:
    - Kdy byla firma založena?
    - Je firma plátce DPH?
    - Je firma identifikovaná osoba k DPH?
    - Jaký má letos přibližně obrat?
    - Nakupuje firma služby ze zahraničí?
    - Používá například OpenAI, Google Workspace, Meta Ads, AWS, Microsoft, Figma or other foreign services?
    - Poskytuje služby zákazníkům do jiných zemí EU?
    - Má firma zaměstnance?
    - Plánuje přijmout prvního zaměstnance?
    - Má firma firemní auto?
    - Má firma vlastní kancelář nebo nájemní smlouvu?
    - Má firma více jednatelů?
    - Má firma účetní nebo daňového poradce?
    - Používá firma vlastní domény?
    - Má firma důležité SaaS subscriptions?
- Based on the answers, automatically create a personalized checklist.
- Examples:
    - If the company buys foreign SaaS and is not a VAT payer, prominently show the identified-person-to-VAT check.
    - If the company is approaching a VAT turnover threshold, show a warning.
    - If the company has no employees, hide normal payroll tasks but keep a checklist for hiring the first employee.
    - If the company has a car, add vehicle-related reminders.
    - If the company uses domains, add domain expiration reminders.
- Show why each automatically added item was added.
- Example:
    - `"Přidáno, protože jste uvedli, že nakupujete SaaS ze zahraničí."`
- Allow the onboarding to be opened again and answers changed.
- Store the onboarding answers and generated items locally using `localStorage`.
- There should be no database.
- Everything should continue working after page refresh.
- Keep the rules for deciding which template items apply outside React components in reusable TypeScript logic.
- Keep in mind the DRY principle.
- Do a proper analysis of the current functionality before implementing.