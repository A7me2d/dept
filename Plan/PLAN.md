# PLAN: Add Loading Design to All API Calls

## Goal
Add visual loading indicators to all API calls across the application to improve user experience by providing immediate feedback when data is being loaded or operations are in progress.

## Angular Context
- **Services involved:**
  - `AuthService` - needs loading signal for login/signup/logout
  - `ExpenseService` - has loading signal, needs to use it for all methods
  - `SettingsService` - has loading signal, needs to use it for all methods
  - `SalaryService` - has loading signal, needs to use it for all methods

- **Components involved:**
  - `LoginComponent` - needs loading state on submit button
  - `DashboardComponent` - needs loading overlay during initial data load
  - Other components that make API calls need appropriate loading indicators

## Styling Strategy
- Use **Tailwind CSS** for all loading indicators:
  - Spinner: `animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-500`
  - Loading overlay: `fixed inset-0 bg-white/80 flex items-center justify-center z-50`
  - Button loading state: `opacity-50 cursor-not-allowed`
  - Skeleton loading: `animate-pulse bg-gray-200`

- CSS/SCSS will NOT be used - Tailwind is sufficient for all loading designs.

## Files Impacted

### Services:
1. `d:\MyWeb\src\app\services\auth.service.ts` - Add `loading` signal
2. `d:\MyWeb\src\app\services\expense.service.ts` - Add loading to `add()`, `update()`, `remove()`, `archive()`, `hardDelete()`
3. `d:\MyWeb\src\app\services\settings.service.ts` - Add loading to `update()`
4. `d:\MyWeb\src\app\services\salary.service.ts` - Add loading to `add()`, `update()`, `remove()`

### Components:
1. `d:\MyWeb\src\app\login\login.component.ts` - Use auth.loading signal
2. `d:\MyWeb\src\app\login\login.component.html` - Add loading spinner to button
3. `d:\MyWeb\src\app\dashboard\dashboard.component.ts` - Track loading state
4. `d:\MyWeb\src\app\dashboard\dashboard.component.html` - Add loading overlay
5. `d:\MyWeb\src\app\add-expense\add-expense.component.ts` - Use expense.loading
6. `d:\MyWeb\src\app\add-expense\add-expense.component.html` - Add loading to submit button
7. `d:\MyWeb\src\app\settings\settings.component.ts` - Use settings.loading
8. `d:\MyWeb\src\app\settings\settings.component.html` - Add loading to save button
9. `d:\MyWeb\src\app\salary\salary.component.ts` - Use salary.loading
10. `d:\MyWeb\src\app\salary\salary.component.html` - Add loading to add/update/delete buttons
11. `d:\MyWeb\src\app\day-details\day-details.component.ts` - Use expense.loading
12. `d:\MyWeb\src\app\day-details\day-details.component.html` - Add loading indicators
13. `d:\MyWeb\src\app\history\history.component.ts` - Use expense.loading
14. `d:\MyWeb\src\app\history\history.component.html` - Add loading indicators

## Step-by-Step Plan

### Phase 1: Add Loading Signals to Services
1. **AuthService** - Add `readonly loading = signal(false)` and set it in `login()`, `signUp()`, `logout()`
2. **ExpenseService** - Add loading state management to `add()`, `update()`, `remove()`, `archive()`, `hardDelete()`
3. **SettingsService** - Add loading state management to `update()`
4. **SalaryService** - Add loading state management to `add()`, `update()`, `remove()`

### Phase 2: Update Login Component
5. Update `login.component.ts` to use `auth.loading` signal
6. Update `login.component.html` to show loading spinner on button and disable it during loading

### Phase 3: Update Dashboard Component
7. Update `dashboard.component.ts` to track overall loading state from services
8. Update `dashboard.component.html` to show loading overlay during initial data load

### Phase 4: Update Add Expense Component
9. Update `add-expense.component.ts` to use `expense.loading`
10. Update `add-expense.component.html` to show loading on submit button

### Phase 5: Update Settings Component
11. Update `settings.component.ts` to use `settings.loading`
12. Update `settings.component.html` to show loading on save button

### Phase 6: Update Salary Component
13. Update `salary.component.ts` to use `salary.loading`
14. Update `salary.component.html` to show loading on add/update/delete buttons

### Phase 7: Update Day Details Component
15. Update `day-details.component.ts` to use `expense.loading`
16. Update `day-details.component.html` to show loading indicators

### Phase 8: Update History Component
17. Update `history.component.ts` to use `expense.loading`
18. Update `history.component.html` to show loading indicators

## Risks & Edge Cases
- **Race conditions:** Multiple simultaneous calls might interfere with loading state - use individual loading signals per operation if needed
- **UX issues:** Loading indicators might flicker for very fast operations - add minimum delay if needed
- **Performance:** Too many loading signals might impact performance - use computed signals where appropriate
- **Breaking changes:** Adding loading signals is backward compatible - no breaking changes expected

## Rollback Strategy
- All changes are additive (adding loading signals and UI indicators)
- No existing functionality is modified
- Can be easily reverted by removing loading-related code
- Git history allows easy rollback of specific commits

## Validation Checklist
- **Visual validation:**
  - [ ] Login button shows spinner during login/signup
  - [ ] Dashboard shows loading overlay on initial load
  - [ ] Add expense button shows spinner during submission
  - [ ] Settings save button shows spinner during update
  - [ ] Salary buttons show spinners during operations
  - [ ] Day details shows loading indicators
  - [ ] History shows loading indicators

- **Functional validation:**
  - [ ] Loading states properly set to true before API calls
  - [ ] Loading states properly set to false after API calls (success or error)
  - [ ] Buttons are disabled during loading
  - [ ] User cannot submit multiple times during loading
  - [ ] Loading indicators disappear after operations complete

- **Code validation:**
  - [ ] All services have loading signals
  - [ ] All API calls use loading signals
  - [ ] All components properly display loading states
  - [ ] Tailwind CSS classes are correct
  - [ ] No console errors during loading operations
