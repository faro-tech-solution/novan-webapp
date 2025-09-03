# Exercise Redirect Functionality Test

## Test Scenarios

### 1. Admin User Creating Exercise
**Steps:**
1. Login as admin
2. Go to `/portal/admin/exercises`
3. Click "Create Exercise" button
4. Fill form with category "JavaScript Basics"
5. Submit form

**Expected Result:**
- Redirect to `/portal/admin/exercises?category=javascript-basics-id`
- Page shows exercises filtered to "JavaScript Basics" category
- New exercise appears in the filtered list

### 2. Trainer User Editing Exercise
**Steps:**
1. Login as trainer
2. Go to `/portal/trainer/exercises`
3. Select category "React Components"
4. Click edit on any exercise
5. Make changes and save

**Expected Result:**
- Redirect to `/portal/trainer/exercises?category=react-components-id`
- Page shows exercises filtered to "React Components" category
- Edited exercise appears in the filtered list

### 3. Trainee User Creating Exercise (if allowed)
**Steps:**
1. Login as trainee
2. Go to `/portal/trainee/course123/exercises`
3. Create exercise with category "HTML Fundamentals"
4. Submit form

**Expected Result:**
- Redirect to `/portal/trainee/course123/exercises?category=html-fundamentals-id`
- Page shows exercises filtered to "HTML Fundamentals" category

### 4. Exercise Without Category
**Steps:**
1. Create/edit exercise without selecting a category
2. Submit form

**Expected Result:**
- Redirect to exercises page without category parameter
- Shows all exercises (no filter applied)

## URL Examples After Redirect

```
# Admin creating exercise in "JavaScript" category
/portal/admin/exercises?category=js-cat-123

# Trainer editing exercise in "React" category  
/portal/trainer/exercises?category=react-cat-456

# Trainee creating exercise in "HTML" category
/portal/trainee/course789/exercises?category=html-cat-789

# Exercise without category
/portal/admin/exercises
```

## Verification Points

1. ✅ URL contains correct category parameter
2. ✅ Page loads with correct category selected
3. ✅ Exercise list is filtered to selected category
4. ✅ New/edited exercise appears in the filtered list
5. ✅ Browser back button works correctly
6. ✅ Direct URL access works (shareable links)
