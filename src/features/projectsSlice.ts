import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getProjects } from '@/api/projects'
import { Project } from '@/types'

interface ProjectsState {
  items: Project[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
}

const initialState: ProjectsState = {
  items: [],
  status: 'idle',
}

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async () => {
    return await getProjects()
  }
)

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => { state.status = 'loading' })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchProjects.rejected, (state) => { state.status = 'failed' })
  },
})

export default projectsSlice.reducer
