"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Building, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Company {
  id: string;
  name: string;
  logo_url?: string;
}

interface CompanySelectorProps {
  value: string; // Company name (text)
  companyId?: string | null; // Selected company ID
  onChange: (name: string, companyId?: string | null | undefined) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export function CompanySelector({
  value,
  companyId,
  onChange,
  label = "Company",
  placeholder = "e.g. ABC Corporation",
  required = false,
}: CompanySelectorProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Company[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchCompanies = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, logo_url")
        .ilike("name", `%${query}%`)
        .order("follower_count", { ascending: false })
        .limit(5);

      if (!error && data) {
        setSuggestions(data);
      }
    } catch (error) {
      console.error("Error searching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue, null); // Clear company ID when typing freely
    setSelectedCompany(null);
    setShowSuggestions(true);

    // Debounce search
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      searchCompanies(newValue);
    }, 300);
  };

  const handleSelectCompany = (company: Company) => {
    setInputValue(company.name);
    setSelectedCompany(company);
    onChange(company.name, company.id);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleClearSelection = () => {
    setSelectedCompany(null);
    setInputValue("");
    onChange("", null);
    setSuggestions([]);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Label htmlFor="company">{label} {required && "*"}</Label>
      <div className="relative">
        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="company"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            setShowSuggestions(true);
            if (inputValue) searchCompanies(inputValue);
          }}
          placeholder={placeholder}
          required={required}
          className={cn(
            "pl-10",
            selectedCompany && "pr-20"
          )}
        />
        {selectedCompany && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Linked
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || loading) && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-sm text-muted-foreground text-center">
              Searching...
            </div>
          ) : (
            <div>
              {suggestions.map((company) => (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => handleSelectCompany(company)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {company.logo_url ? (
                      <img
                        src={company.logo_url}
                        alt={company.name}
                        className="h-full w-full object-cover rounded"
                      />
                    ) : (
                      <Building className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {company.name}
                    </p>
                  </div>
                </button>
              ))}
              <div className="border-t p-2">
                <Link
                  href="/companies/create"
                  className="flex items-center justify-center gap-2 p-2 text-sm text-primary hover:bg-gray-50 rounded transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create new company page
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-1">
        {selectedCompany 
          ? "Linked to company page - employees will see this on the company page"
          : "Type to search existing companies or enter manually"}
      </p>
    </div>
  );
}

