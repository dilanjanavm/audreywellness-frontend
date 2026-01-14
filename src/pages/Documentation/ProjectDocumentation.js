import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "reactstrap";
import { 
  BookOutlined, 
  HomeOutlined, 
  SearchOutlined,
  ClockCircleOutlined,
  DesktopOutlined,
  ToolOutlined,
  ApiOutlined,
  FileTextOutlined,
  StarOutlined,
  UpOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Input, Spin, Tag, AutoComplete } from "antd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./ProjectDocumentation.scss";

const { Search } = Input;

// Documentation keywords for search suggestions
const documentationKeywords = [
  { value: "overview", label: "Overview", section: "overview" },
  { value: "getting started", label: "Getting Started", section: "getting-started-after-login" },
  { value: "system architecture", label: "System Architecture", section: "system-architecture" },
  { value: "navigation", label: "Navigation Structure", section: "navigation-structure" },
  { value: "master data", label: "Master Data", section: "master-data-vs-dependent-data" },
  { value: "dependent data", label: "Dependent Data", section: "master-data-vs-dependent-data" },
  { value: "setup workflow", label: "Initial Setup Workflow", section: "initial-setup-workflow" },
  { value: "module catalog", label: "Module Catalog", section: "module-catalog" },
  { value: "user workflows", label: "User Workflows", section: "user-workflows" },
  { value: "data import", label: "Data Import Order", section: "data-import-order" },
  { value: "module dependencies", label: "Module Dependencies", section: "module-dependencies" },
  { value: "quick reference", label: "Quick Reference Guide", section: "quick-reference-guide" },
  { value: "categories", label: "Categories", section: "master-data-vs-dependent-data" },
  { value: "users", label: "Users", section: "master-data-vs-dependent-data" },
  { value: "roles", label: "Roles", section: "master-data-vs-dependent-data" },
  { value: "permissions", label: "Permissions", section: "master-data-vs-dependent-data" },
  { value: "suppliers", label: "Suppliers", section: "master-data-vs-dependent-data" },
  { value: "customers", label: "Customers", section: "master-data-vs-dependent-data" },
  { value: "items", label: "Items/Products", section: "master-data-vs-dependent-data" },
  { value: "products", label: "Products", section: "master-data-vs-dependent-data" },
  { value: "recipes", label: "Recipes", section: "module-catalog" },
  { value: "costing", label: "Costing", section: "module-catalog" },
  { value: "tasks", label: "Tasks", section: "module-catalog" },
  { value: "complaints", label: "Complaints", section: "module-catalog" },
  { value: "courier", label: "Courier Management", section: "module-catalog" },
  { value: "dashboard", label: "Dashboard", section: "navigation-structure" },
  { value: "csv import", label: "CSV Import", section: "user-workflows" },
  { value: "kanban", label: "Kanban Board", section: "user-workflows" },
  { value: "authentication", label: "Authentication", section: "getting-started-after-login" },
  { value: "api", label: "API", section: "api-overview" },
];

const ProjectDocumentation = () => {
  document.title = "Project Documentation | Address Shop";
  const navigate = useNavigate();
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showContent, setShowContent] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Navigation cards data
  const navCards = [
    {
      id: "quickstart",
      icon: <ClockCircleOutlined />,
      title: "Quickstart",
      description: "Our quickstarts help you get something",
      links: [
        { label: "Getting Started", id: "getting-started-after-login" },
        { label: "Initial Setup", id: "initial-setup-workflow" },
        { label: "First Steps", id: "overview" }
      ]
    },
    {
      id: "platform-basics",
      icon: <DesktopOutlined />,
      title: "Platform Basics",
      description: "Basic principles of working with the platform",
      links: [
        { label: "Master Data", id: "master-data-vs-dependent-data" },
        { label: "Module Catalog", id: "module-catalog" },
        { label: "Navigation", id: "navigation-structure" }
      ]
    },
    {
      id: "developer-guides",
      icon: <ToolOutlined />,
      title: "Developer Guides",
      description: "These articles are about development basics",
      links: [
        { label: "System Architecture", id: "system-architecture" },
        { label: "User Workflows", id: "user-workflows" },
        { label: "Module Dependencies", id: "module-dependencies" }
      ]
    },
    {
      id: "api",
      icon: <ApiOutlined />,
      title: "API",
      description: "All about working with API",
      links: [
        { label: "API Overview", id: "api-overview" },
        { label: "API Integration", id: "api-integration" },
        { label: "API Reference", id: "api-reference" }
      ]
    }
  ];

  // Popular articles
  const popularArticles = [
    { title: "Roadmap Funnels Tests", id: "roadmap-funnels" },
    { title: "Roadmap Trading Platform", id: "roadmap-trading" }
  ];

  // New articles
  const newArticles = [
    { title: "How to Add Funnle", id: "add-funnel" },
    { title: "Epics", id: "epics" }
  ];

  useEffect(() => {
    loadDocumentation();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Show button when scrolled down more than 300px
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadDocumentation = async () => {
    try {
      const response = await fetch("/docs/PROJECT_DOCUMENTATION.md");
      if (response.ok) {
        const text = await response.text();
        setMarkdown(text);
      } else {
        const altResponse = await fetch("/PROJECT_DOCUMENTATION.md");
        if (altResponse.ok) {
          const text = await altResponse.text();
          setMarkdown(text);
        } else {
          throw new Error("Documentation file not found");
        }
      }
    } catch (error) {
      console.error("Error loading documentation:", error);
      setMarkdown(`# Project Documentation\n\nDocumentation content will be displayed here.`);
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (id) => {
    setShowContent(true);
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const offset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      } else {
        // Scroll to content area
        const contentArea = document.querySelector(".doc-content-section");
        if (contentArea) {
          contentArea.scrollIntoView({ behavior: "smooth" });
        }
      }
    }, 100);
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    if (value.trim()) {
      setShowContent(true);
      // Find matching section and scroll to it
      const keyword = documentationKeywords.find(
        (kw) => kw.value.toLowerCase() === value.toLowerCase() || 
                kw.label.toLowerCase().includes(value.toLowerCase())
      );
      if (keyword) {
        scrollToSection(keyword.section);
      } else {
        // Scroll to content area
        setTimeout(() => {
          const contentArea = document.querySelector(".doc-content-section");
          if (contentArea) {
            contentArea.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    }
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (value.trim()) {
      // Filter suggestions based on input
      const filtered = documentationKeywords.filter(
        (kw) =>
          kw.value.toLowerCase().includes(value.toLowerCase()) ||
          kw.label.toLowerCase().includes(value.toLowerCase())
      );
      setSearchSuggestions(
        filtered.slice(0, 8).map((kw) => ({
          value: kw.label,
          section: kw.section,
        }))
      );
    } else {
      setSearchSuggestions([]);
    }
  };

  const handleSelectSuggestion = (value, option) => {
    const selectedOption = typeof option === 'object' ? option : searchSuggestions.find(s => s.value === value);
    setSearchQuery(value);
    setShowContent(true);
    setTimeout(() => {
      if (selectedOption && selectedOption.section) {
        scrollToSection(selectedOption.section);
      } else {
        handleSearch(value);
      }
    }, 100);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className="doc-inline-code">{children}</code>
      );
    },
    h1: ({ children }) => {
      const id = children?.toString().toLowerCase().replace(/\s+/g, "-");
      return (
        <h1 className="doc-heading doc-h1" id={id}>
          {children}
        </h1>
      );
    },
    h2: ({ children }) => {
      const id = children?.toString().toLowerCase().replace(/\s+/g, "-");
      return (
        <h2 className="doc-heading doc-h2" id={id}>
          {children}
        </h2>
      );
    },
    h3: ({ children }) => (
      <h3 className="doc-heading doc-h3">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="doc-heading doc-h4">{children}</h4>
    ),
    p: ({ children }) => <p className="doc-paragraph">{children}</p>,
    table: ({ children }) => (
      <div className="doc-table-wrapper">
        <table className="doc-table">{children}</table>
      </div>
    ),
    blockquote: ({ children }) => (
      <blockquote className="doc-blockquote">{children}</blockquote>
    ),
    ul: ({ children }) => <ul className="doc-list">{children}</ul>,
    ol: ({ children }) => <ol className="doc-list doc-list-ordered">{children}</ol>,
    li: ({ children }) => <li className="doc-list-item">{children}</li>,
    a: ({ href, children }) => (
      <a href={href} className="doc-link" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    strong: ({ children }) => <strong className="doc-strong">{children}</strong>,
  };

  return (
    <div className="doc-page">
      {/* Header Section */}
      <header className="doc-header">
        <Container>
          <div className="doc-header-wrapper">
            <div className="doc-header-left">
              <div className="doc-illustration">
                <div className="doc-folder doc-folder-1"></div>
                <div className="doc-folder doc-folder-2"></div>
                <div className="doc-folder doc-folder-3"></div>
                <div className="doc-document doc-doc-1"></div>
                <div className="doc-document doc-doc-2"></div>
              </div>
              <div className="doc-header-text">
                <h1 className="doc-title">Documentation</h1>
                <p className="doc-subtitle">
                  Here you will find all the information you need regarding our CRM and you can also ask for{" "}
                  <a href="#support" className="doc-support-link">support</a>
                </p>
              </div>
            </div>
            <button className="doc-back-btn" onClick={() => navigate("/dashboard")}>
              <HomeOutlined />
            </button>
          </div>
        </Container>
      </header>

      {/* Search Bar */}
      <div className="doc-search-section">
        <Container>
          <div className="doc-search-wrapper">
            <AutoComplete
              options={searchSuggestions.map((suggestion) => ({
                value: suggestion.value,
                label: suggestion.value,
                section: suggestion.section,
              }))}
              onSelect={(value, option) => handleSelectSuggestion(value, option)}
              onSearch={handleSearchChange}
              value={searchQuery}
              className="doc-search-autocomplete"
              size="large"
             
              allowClear
              notFoundContent={searchQuery && searchSuggestions.length === 0 ? "No results found" : null}
              filterOption={false}
            >
              <Input
                placeholder="Search documentation..."
                allowClear
                suffix={
                  <SearchOutlined
                    onClick={() => handleSearch(searchQuery)}
                    className="doc-search-icon"
                  />
                }
                onPressEnter={() => handleSearch(searchQuery)}
                className="doc-search-input"
              />
            </AutoComplete>
          </div>
        </Container>
      </div>

      {/* Navigation Cards Grid */}
      <section className="doc-nav-cards-section">
        <Container>
          <Row className="doc-cards-row">
            {navCards.map((card) => (
              <Col lg={6} md={6} sm={12} key={card.id} className="doc-card-col">
                <div className="doc-nav-card">
                  <div className="doc-card-icon">{card.icon}</div>
                  <h3 className="doc-card-title">{card.title}</h3>
                  <p className="doc-card-description">{card.description}</p>
                  <ul className="doc-card-links">
                    {card.links.map((link, index) => (
                      <li key={index}>
                        <FileTextOutlined className="doc-link-icon" />
                        <button
                          className="doc-card-link"
                          onClick={() => scrollToSection(link.id)}
                        >
                          {link.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Popular Articles */}
      <section className="doc-articles-section">
        <Container>
          <div className="doc-articles-wrapper">
            <div className="doc-articles-group">
              <h3 className="doc-articles-title">
                <StarOutlined className="doc-articles-icon" />
                Popular Articles
              </h3>
              <div className="doc-articles-list">
                {popularArticles.map((article, index) => (
                  <div
                    key={index}
                    className="doc-article-item"
                    onClick={() => scrollToSection(article.id)}
                  >
                    {article.title}
                  </div>
                ))}
              </div>
            </div>

            <div className="doc-articles-group">
              <h3 className="doc-articles-title">New Articles</h3>
              <div className="doc-articles-list">
                {newArticles.map((article, index) => (
                  <div
                    key={index}
                    className="doc-article-item doc-article-new"
                    onClick={() => scrollToSection(article.id)}
                  >
                    {article.title}
                    <Tag color="#458533" className="doc-new-tag">New</Tag>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Documentation Content Section */}
      {(showContent || searchQuery) && (
        <section className="doc-content-section" id="doc-content">
          <Container>
            <div className="doc-content-wrapper">
              {loading ? (
                <div className="doc-loading">
                  <Spin size="large" />
                  <p>Loading documentation...</p>
                </div>
              ) : (
                <div className="doc-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                    {markdown}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button 
          className="doc-scroll-top-btn"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <UpOutlined />
        </button>
      )}
    </div>
  );
};

export default ProjectDocumentation;
