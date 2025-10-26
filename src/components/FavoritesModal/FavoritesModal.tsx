import { useState, useEffect, type FC } from 'react'
import { createPortal } from 'react-dom'
import { useAppState } from '../../context/AppStateContext'
import type { FavoritePreset } from '../../types/appState'
import {
  loadFavorites,
  saveFavorite,
  deleteFavorite,
  renameFavorite,
  duplicateFavorite,
  downloadFavoritesFile,
  uploadFavoritesFile,
} from '../../utils/favorites'
import classes from './FavoritesModal.module.css'

interface FavoritesModalProps {
  isOpen: boolean
  onClose: () => void
  onMessage: (message: string, isError?: boolean) => void
}

export const FavoritesModal: FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  onMessage,
}) => {
  const { state, actions } = useAppState()
  const [favorites, setFavorites] = useState<FavoritePreset[]>([])
  const [newPresetName, setNewPresetName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  // Load favorites when modal opens
  useEffect(() => {
    if (isOpen) {
      setFavorites(loadFavorites())
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSave = () => {
    if (!newPresetName.trim()) {
      onMessage('Please enter a preset name', true)
      return
    }

    try {
      saveFavorite(
        newPresetName.trim(),
        state.accents,
        state.rudiment,
        state.tempo,
        state.instrumentMapping
      )
      setFavorites(loadFavorites())
      setNewPresetName('')
      onMessage('Preset saved successfully!')
    } catch (error) {
      onMessage('Failed to save preset', true)
    }
  }

  const handleLoad = (preset: FavoritePreset) => {
    actions.loadPreset(preset)
    onMessage(`Loaded preset: ${preset.name}`)
    onClose()
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this preset?')) {
      deleteFavorite(id)
      setFavorites(loadFavorites())
      onMessage('Preset deleted')
    }
  }

  const handleStartRename = (preset: FavoritePreset) => {
    setEditingId(preset.id)
    setEditingName(preset.name)
  }

  const handleSaveRename = (id: string) => {
    if (!editingName.trim()) {
      onMessage('Preset name cannot be empty', true)
      return
    }

    renameFavorite(id, editingName.trim())
    setFavorites(loadFavorites())
    setEditingId(null)
    onMessage('Preset renamed')
  }

  const handleCancelRename = () => {
    setEditingId(null)
    setEditingName('')
  }

  const handleDuplicate = (id: string) => {
    const duplicated = duplicateFavorite(id)
    if (duplicated) {
      setFavorites(loadFavorites())
      onMessage('Preset duplicated')
    } else {
      onMessage('Failed to duplicate preset', true)
    }
  }

  const handleExport = () => {
    try {
      downloadFavoritesFile()
      onMessage('Favorites exported successfully!')
    } catch (error) {
      onMessage('Failed to export favorites', true)
    }
  }

  const handleImport = async () => {
    try {
      const count = await uploadFavoritesFile(true)
      setFavorites(loadFavorites())
      onMessage(`Successfully imported ${count} preset${count !== 1 ? 's' : ''}`)
    } catch (error) {
      onMessage('Failed to import favorites', true)
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const getPresetSummary = (preset: FavoritePreset) => {
    const accentCount = preset.accents.filter(Boolean).length
    return `${preset.rudiment} | ${preset.tempo} BPM | ${accentCount} accent${accentCount !== 1 ? 's' : ''}`
  }

  return createPortal(
    <div className={classes.overlay} onClick={handleOverlayClick}>
      <div className={classes.modal}>
        <div className={classes.header}>
          <h2 className={classes.title}>Favorite Presets</h2>
          <button
            className={classes.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Save current settings */}
        <div className={classes.section}>
          <h3 className={classes.sectionTitle}>Save Current Settings</h3>
          <div className={classes.saveForm}>
            <input
              type="text"
              className={classes.input}
              placeholder="Enter preset name..."
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave()
                }
              }}
            />
            <button
              className={classes.button}
              onClick={handleSave}
              disabled={!newPresetName.trim()}
            >
              Save
            </button>
          </div>
        </div>

        {/* Saved presets list */}
        <div className={classes.section}>
          <h3 className={classes.sectionTitle}>
            Saved Presets ({favorites.length})
          </h3>
          {favorites.length === 0 ? (
            <div className={classes.emptyState}>
              No saved presets yet. Save your current settings above!
            </div>
          ) : (
            <div className={classes.presetList}>
              {favorites.map((preset) => (
                <div key={preset.id} className={classes.presetItem}>
                  <div className={classes.presetInfo}>
                    {editingId === preset.id ? (
                      <input
                        type="text"
                        className={classes.renameInput}
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveRename(preset.id)
                          } else if (e.key === 'Escape') {
                            handleCancelRename()
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <div className={classes.presetName}>{preset.name}</div>
                    )}
                    <div className={classes.presetDetails}>
                      {getPresetSummary(preset)} • {formatDate(preset.createdAt)}
                    </div>
                  </div>
                  <div className={classes.presetActions}>
                    {editingId === preset.id ? (
                      <>
                        <button
                          className={classes.iconButton}
                          onClick={() => handleSaveRename(preset.id)}
                          title="Save"
                        >
                          ✓
                        </button>
                        <button
                          className={classes.iconButton}
                          onClick={handleCancelRename}
                          title="Cancel"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className={classes.iconButton}
                          onClick={() => handleLoad(preset)}
                          title="Load preset"
                        >
                          ▶
                        </button>
                        <button
                          className={classes.iconButton}
                          onClick={() => handleStartRename(preset)}
                          title="Rename"
                        >
                          ✎
                        </button>
                        <button
                          className={classes.iconButton}
                          onClick={() => handleDuplicate(preset.id)}
                          title="Duplicate"
                        >
                          ⎘
                        </button>
                        <button
                          className={classes.iconButton}
                          onClick={() => handleDelete(preset.id)}
                          title="Delete"
                        >
                          🗑
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Import/Export */}
        <div className={classes.importExport}>
          <button
            className={`${classes.button} ${classes.buttonSecondary}`}
            onClick={handleImport}
          >
            Import from File
          </button>
          <button
            className={`${classes.button} ${classes.buttonSecondary}`}
            onClick={handleExport}
            disabled={favorites.length === 0}
          >
            Export to File
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
