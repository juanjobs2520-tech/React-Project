import { FiCheck } from 'react-icons/fi';

interface Rule {
  id: string;
  text: string;
  ok?: boolean;
}

interface RulesPanelProps {
  title?: string;
  rules: Rule[];
}

const RulesPanel = ({ title = 'Reglas', rules }: RulesPanelProps) => (
  <aside className="edugest-rules-panel">
    <h3 className="edugest-rules-title">{title}</h3>
    <ul className="edugest-rules-list">
      {rules.map((rule) => (
        <li key={rule.id} className="edugest-rules-item">
          <FiCheck className={rule.ok === false ? 'edugest-rules-icon-warn' : 'edugest-rules-icon-ok'} />
          <span>{rule.text}</span>
        </li>
      ))}
    </ul>
  </aside>
);

export default RulesPanel;
