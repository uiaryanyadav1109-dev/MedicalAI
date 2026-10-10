package com.medicalai.app

import android.app.PendingIntent
import android.content.Intent
import android.graphics.drawable.Icon
import android.os.Build
import android.service.quicksettings.Tile
import android.service.quicksettings.TileService

/**
 * SOSTileService: Quick Settings Tile accessible from the Android Lock Screen.
 * When tapped by a user in the notification shade:
 * 1. Collapses the Quick Settings panel immediately.
 * 2. Launches SOSActivity directly over the lock screen without authentication gating.
 */
class SOSTileService : TileService() {

    override fun onStartListening() {
        super.onStartListening()
        val tile = qsTile ?: return

        tile.label = "Emergency SOS"
        tile.contentDescription = "Trigger Emergency Distress Beacon"
        tile.state = Tile.STATE_INACTIVE
        tile.updateTile()
    }

    override fun onClick() {
        super.onClick()

        val tile = qsTile
        tile?.state = Tile.STATE_ACTIVE
        tile?.updateTile()

        // Create explicit intent targeting the lock-screen SOSActivity
        val intent = Intent(this, SOSActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra("EXTRA_TRIGGER_SOURCE", "QUICK_SETTINGS_TILE")
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            // Android 14+ requires PendingIntent for startActivityAndCollapse
            val pendingIntent = PendingIntent.getActivity(
                this,
                1001,
                intent,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )
            startActivityAndCollapse(pendingIntent)
        } else {
            @Suppress("DEPRECATION")
            startActivityAndCollapse(intent)
        }

        // Reset tile state after a delay
        tile?.state = Tile.STATE_INACTIVE
        tile?.updateTile()
    }
}
