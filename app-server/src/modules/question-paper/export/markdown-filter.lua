function Div(el)
  -- Check if the div has the class "markdown"
  if el.classes:includes("markdown") then
    -- Get the raw content of the div
    local content = pandoc.utils.stringify(el)
    -- Parse that content string as markdown and return the result
    return pandoc.read(content, 'markdown').blocks
  end
end

-- Function to convert h6 with class="heading7" to Heading 7 style
function Header(el)
  if el.level == 6 and el.classes:includes("heading7") then
    -- Set custom style for Heading 7
    el.attr.attributes['custom-style'] = 'Heading 7'
    return el
  end
  return el
end

-- Function to apply table cell alignment from custom reference
function Table(tbl)
  -- Apply centering to table header cells only
  if tbl.head and tbl.head.rows then
    for _, row in ipairs(tbl.head.rows) do
      for _, cell in ipairs(row.cells) do
        if not cell.attr then
          cell.attr = pandoc.Attr()
        end
        cell.attr.attributes = cell.attr.attributes or {}
        cell.attr.attributes['style'] = 'text-align: center; vertical-align: middle;'
      end
    end
  end
  
  return tbl
end
