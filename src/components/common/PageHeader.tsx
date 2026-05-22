import { Link } from 'react-router-dom';
import { ReactNode } from 'react';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
}

const PageHeader = ({ title, breadcrumbs, actions }: PageHeaderProps) => (
  <div className="edugest-page-header">
    <div>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="edugest-breadcrumb" aria-label="Breadcrumb">
          {breadcrumbs.map((item, i) => (
            <span key={item.label}>
              {i > 0 && <span> / </span>}
              {item.to ? <Link to={item.to}>{item.label}</Link> : <span className="edugest-breadcrumb-active">{item.label}</span>}
            </span>
          ))}
        </nav>
      )}
      <h1 className="edugest-page-title">{title}</h1>
    </div>
    {actions && <div>{actions}</div>}
  </div>
);

export default PageHeader;
