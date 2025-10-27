# Q&A Helper Functions Documentation

## 📋 Overview

This file contains utility functions for working with the Exercise Q&A system. These helpers facilitate common operations like extracting user votes, checking bookmarks, building hierarchical structures, and validating input data.

## 🔧 Available Functions

### 1. Vote Management

#### `getUserVote(qaItem: ExerciseQAWithDetails): 1 | -1 | null`
Extracts the current user's vote from Q&A data.

**Returns:**
- `1` - User has upvoted
- `-1` - User has downvoted  
- `null` - No vote exists

**Usage:**
```typescript
const userVote = getUserVote(qaItem);
if (userVote === 1) {
  console.log('User upvoted this post');
}
```

#### `getVoteStatus(qaItem: ExerciseQAWithDetails): VoteStatus`
Returns user-friendly vote status.

**Returns:** `'upvoted' | 'downvoted' | 'none'`

**Usage:**
```typescript
const status = getVoteStatus(qaItem);
const buttonColor = status === 'upvoted' ? 'green' : 'gray';
```

---

### 2. Bookmark Management

#### `isBookmarked(qaItem: ExerciseQAWithDetails): boolean`
Checks if a post is bookmarked by the current user.

**Usage:**
```typescript
const bookmarked = isBookmarked(qaItem);
setBookmarkIcon(bookmarked ? 'filled' : 'outline');
```

---

### 3. User Information

#### `getUserFullName(user: SubmissionStudent, fallback?: string): string`
Builds user's full name from profile data.

**Parameters:**
- `user` - User profile object
- `fallback` - Optional fallback text (default: 'کاربر ناشناس')

**Usage:**
```typescript
const name = getUserFullName(qaItem.user);
// "علی محمدی"

const nameWithCustomFallback = getUserFullName(qaItem.user, "Anonymous");
// "Anonymous" if no name available
```

#### `getUserInitials(user: SubmissionStudent): string`
Gets user initials for avatar display.

**Returns:** Two-letter initials (e.g., "AM" for "علی محمدی")

**Usage:**
```typescript
const initials = getUserInitials(qaItem.user);
// Display in avatar: "AM"
```

---

### 4. Tree Structure Building

#### `buildQATree(qaList: ExerciseQAWithDetails[]): ExerciseQAWithDetails[]`
Transforms flat list into hierarchical tree structure.

**Features:**
- Converts parent-child relationships into nested structure
- Sorts questions by creation date (newest first)
- Sorts answers/replies by vote count, then creation date
- Handles unlimited nesting depth

**Usage:**
```typescript
const flatList = await fetchQAList(exerciseId);
const tree = buildQATree(flatList);

// Access structure:
tree[0]                    // First question
tree[0].replies            // All answers to first question
tree[0].replies[0].replies // All replies to first answer
```

**Example Input:**
```json
[
  { "id": "1", "title": "Question?", "parent_id": null },
  { "id": "2", "description": "Answer 1", "parent_id": "1" },
  { "id": "3", "description": "Reply to answer", "parent_id": "2" }
]
```

**Example Output:**
```json
[
  {
    "id": "1",
    "title": "Question?",
    "parent_id": null,
    "replies": [
      {
        "id": "2",
        "description": "Answer 1",
        "parent_id": "1",
        "replies": [
          {
            "id": "3",
            "description": "Reply to answer",
            "parent_id": "2",
            "replies": []
          }
        ]
      }
    ]
  }
]
```

---

### 5. Depth and Type Detection

#### `getQADepth(qaItem: ExerciseQAWithDetails, qaList: ExerciseQAWithDetails[]): number`
Gets the depth level of a Q&A item in the tree.

**Returns:**
- `0` - Question (root level)
- `1` - Direct answer to question
- `2+` - Nested replies

**Usage:**
```typescript
const depth = getQADepth(qaItem, qaList);
const indentation = depth * 24; // 24px per level
const marginLeft = `${indentation}px`;
```

#### `getQAPostType(qaItem: ExerciseQAWithDetails): 'question' | 'answer' | 'reply'`
Determines the type of Q&A post.

**Usage:**
```typescript
const type = getQAPostType(qaItem);
if (type === 'question') {
  showQuestionIcon();
}
```

---

### 6. Counting and Statistics

#### `countTotalReplies(qaItem: ExerciseQAWithDetails): number`
Counts total replies including nested ones.

**Usage:**
```typescript
const total = countTotalReplies(question);
console.log(`${total} پاسخ`); // "15 پاسخ"
```

---

### 7. Date Formatting

#### `formatQADate(createdAt: string, locale?: 'fa' | 'en'): string`
Formats creation date as relative time.

**Parameters:**
- `createdAt` - ISO date string
- `locale` - Language locale (default: 'fa')

**Returns:** Relative time string

**Usage:**
```typescript
const timeAgo = formatQADate(qaItem.created_at, 'fa');
// "۲ ساعت پیش"

const timeAgoEn = formatQADate(qaItem.created_at, 'en');
// "2 hours ago"
```

**Examples:**
- Less than 1 minute: "لحظاتی پیش" / "just now"
- Minutes: "۵ دقیقه پیش" / "5 minutes ago"
- Hours: "۲ ساعت پیش" / "2 hours ago"
- Days: "۳ روز پیش" / "3 days ago"
- Months: "۲ ماه پیش" / "2 months ago"
- Years: "۱ سال پیش" / "1 year ago"

---

### 8. Authorization

#### `isCurrentUserAuthor(qaItem: ExerciseQAWithDetails, currentUserId: string): boolean`
Checks if current user is the author of a post.

**Usage:**
```typescript
const canEdit = isCurrentUserAuthor(qaItem, currentUser.id);
if (canEdit) {
  showEditButton();
  showDeleteButton();
}
```

---

### 9. Validation

#### `validateQuestionData(title: string, description: string)`
Validates question data before submission.

**Validation Rules:**
- Title: 10-200 characters
- Description: 20-5000 characters
- Both fields required

**Returns:**
```typescript
{
  isValid: boolean;
  error?: string;
}
```

**Usage:**
```typescript
const validation = validateQuestionData(title, description);
if (!validation.isValid) {
  showError(validation.error);
  return;
}
// Proceed with submission
```

#### `validateAnswerData(description: string)`
Validates answer/reply data before submission.

**Validation Rules:**
- Description: 10-5000 characters
- Field required

**Usage:**
```typescript
const validation = validateAnswerData(description);
if (!validation.isValid) {
  showError(validation.error);
  return;
}
// Proceed with submission
```

---

## 📦 Import Usage

All functions can be imported from the main utils index:

```typescript
// Import individual functions
import { 
  getUserVote, 
  isBookmarked, 
  buildQATree,
  getUserFullName 
} from '@/utils';

// Or import directly from qa-helpers
import { buildQATree } from '@/utils/qa-helpers';
```

---

## 🎯 Common Use Cases

### Display Q&A Thread
```typescript
const qaList = await fetchQAList(exerciseId);
const tree = buildQATree(qaList);

tree.forEach(question => {
  renderQuestion(question);
  
  question.replies?.forEach(answer => {
    renderAnswer(answer, 1); // depth = 1
    
    answer.replies?.forEach(reply => {
      renderReply(reply, 2); // depth = 2
    });
  });
});
```

### Show User Info with Vote Status
```typescript
const userName = getUserFullName(qaItem.user);
const voteStatus = getVoteStatus(qaItem);
const bookmarked = isBookmarked(qaItem);
const timeAgo = formatQADate(qaItem.created_at);

return (
  <div>
    <span>{userName}</span>
    <span>{timeAgo}</span>
    <VoteButton status={voteStatus} />
    <BookmarkButton active={bookmarked} />
  </div>
);
```

### Validate and Submit Question
```typescript
const handleSubmit = async () => {
  const validation = validateQuestionData(title, description);
  
  if (!validation.isValid) {
    toast.error(validation.error);
    return;
  }

  await createQuestion({ title, description, exercise_id });
  toast.success('سؤال با موفقیت ثبت شد');
};
```

---

## 🧪 Testing

These helper functions are pure and side-effect free, making them easy to test:

```typescript
import { buildQATree, getUserFullName } from '@/utils/qa-helpers';

describe('buildQATree', () => {
  it('should convert flat list to tree', () => {
    const flat = [
      { id: '1', parent_id: null, title: 'Q1' },
      { id: '2', parent_id: '1', description: 'A1' }
    ];
    
    const tree = buildQATree(flat);
    
    expect(tree).toHaveLength(1);
    expect(tree[0].replies).toHaveLength(1);
  });
});
```

---

## 🔄 Future Enhancements

Potential additions:
- Search and filter helpers
- Sorting strategies
- Export/import functions
- Analytics helpers
- Notification formatting

---

## 📚 Related Files

- **Types**: `src/types/qa.ts`
- **Services**: `src/services/qa.service.ts` (Phase 4)
- **Hooks**: `src/hooks/useQA.ts` (Phase 5)
- **Components**: `src/components/exercises/qa/` (Phase 6)

