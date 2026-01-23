import fitz  # PyMuPDF
import sys

# Create a test PDF
doc = fitz.open()
page = doc.new_page(width=612, height=792)  # Letter size

print(f"Page dimensions: {page.rect}")
print(f"Page height: {page.rect.height}")
print()

# Test 1: Insert text at TOP of page
# rect[3] = top means high Y value (near 792)
top_y = 750  # Near top (792 - 750 = 42 points from top)
page.insert_text((100, top_y), "TEXT AT Y=750 (SHOULD BE NEAR TOP)", fontsize=12)

# Test 2: Insert text at BOTTOM of page  
bottom_y = 50  # Near bottom
page.insert_text((100, bottom_y), "TEXT AT Y=50 (SHOULD BE NEAR BOTTOM)", fontsize=12)

# Test 3: Insert at middle
middle_y = 400
page.insert_text((100, middle_y), "TEXT AT Y=400 (SHOULD BE IN MIDDLE)", fontsize=12)

# Save and check
doc.save("c:/PDF PHD/coordinate_test.pdf")
doc.close()

print("Test PDF created: coordinate_test.pdf")
print("Check if:")
print("  - 'TEXT AT Y=750' appears at the TOP")
print("  - 'TEXT AT Y=50' appears at the BOTTOM") 
print("  - 'TEXT AT Y=400' appears in the MIDDLE")
