What should happen to your old code

Your old code should be split roughly like this:

Keep in useListPageRuntime.ts

useRuntimeContext()

useEntityList(...)

route state parsing/writing

search debounce

page size / page changes

selection state

sort state

filter state

event emission logic

bulk action execution wiring

item open handling

Move to ListPage.controller.tsx

call useListPageRuntime()

call:

buildPageHeaderViewModel(...)

buildTabsViewModel(...)

buildDataGridViewModel(...) or buildCardListViewModel(...)

buildPaginationViewModel(...)

buildListPageViewModel(...)

render <ListPage {...viewModel} />

Keep in ListPage.tsx

Only JSX composition.
