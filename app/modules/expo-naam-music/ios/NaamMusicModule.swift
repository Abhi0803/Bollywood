import ExpoModulesCore
import MusicKit

// Naam Bolo native bridge to Apple MusicKit (iOS 15+ Swift framework).
//
// Surface area kept deliberately small — only what the React layer needs:
//   - requestAuthorization / getAuthorizationStatus
//   - canPlayCatalogContent (true only when the user has an active
//     Apple Music subscription that allows catalog playback)
//   - searchCatalog (used to map iTunes track titles → Apple Music IDs;
//     the iTunes Search API IDs and MusicKit catalog IDs are NOT the same)
//   - play / pause / stop / getPlaybackState (ApplicationMusicPlayer drives
//     real full-track playback; falls back to expo-audio previews when
//     the user isn't subscribed)

@available(iOS 15.0, *)
public class NaamMusicModule: Module {
  public func definition() -> ModuleDefinition {
    Name("NaamMusicModule")

    // -- Authorization --------------------------------------------------

    Function("getAuthorizationStatus") { () -> String in
      return Self.statusString(MusicAuthorization.currentStatus)
    }

    AsyncFunction("requestAuthorization") { (promise: Promise) in
      Task { @MainActor in
        let status = await MusicAuthorization.request()
        promise.resolve(Self.statusString(status))
      }
    }

    // -- Subscription ---------------------------------------------------

    AsyncFunction("canPlayCatalogContent") { (promise: Promise) in
      Task {
        do {
          let sub = try await MusicSubscription.current
          promise.resolve(sub.canPlayCatalogContent)
        } catch {
          // No subscription, no Apple Music, or transient network — all
          // treated the same: cannot play catalog content right now.
          promise.resolve(false)
        }
      }
    }

    // -- Catalog search -------------------------------------------------

    AsyncFunction("searchCatalog") { (query: String, limit: Int, promise: Promise) in
      Task {
        do {
          var req = MusicCatalogSearchRequest(term: query, types: [Song.self])
          req.limit = max(1, min(limit, 25))
          let response = try await req.response()
          let results: [[String: Any?]] = response.songs.prefix(req.limit).map { song in
            return [
              "id": song.id.rawValue,
              "title": song.title,
              "artistName": song.artistName,
              "albumTitle": song.albumTitle,
              "durationSeconds": song.duration,
              "artworkUrl": song.artwork?.url(width: 200, height: 200)?.absoluteString
            ]
          }
          promise.resolve(results)
        } catch {
          promise.reject("E_MUSICKIT_SEARCH", error.localizedDescription)
        }
      }
    }

    // -- Playback -------------------------------------------------------

    AsyncFunction("play") { (catalogId: String, promise: Promise) in
      Task { @MainActor in
        do {
          let player = ApplicationMusicPlayer.shared
          let songId = MusicItemID(catalogId)
          // Resolve the song by ID so we can queue it.
          let req = MusicCatalogResourceRequest<Song>(matching: \.id, equalTo: songId)
          let response = try await req.response()
          guard let song = response.items.first else {
            promise.reject("E_MUSICKIT_NOT_FOUND", "Song \(catalogId) not in Apple Music catalog")
            return
          }
          player.queue = ApplicationMusicPlayer.Queue(for: [song])
          try await player.prepareToPlay()
          try await player.play()
          promise.resolve(nil)
        } catch {
          promise.reject("E_MUSICKIT_PLAY", error.localizedDescription)
        }
      }
    }

    AsyncFunction("pause") { (promise: Promise) in
      Task { @MainActor in
        ApplicationMusicPlayer.shared.pause()
        promise.resolve(nil)
      }
    }

    AsyncFunction("stop") { (promise: Promise) in
      Task { @MainActor in
        ApplicationMusicPlayer.shared.stop()
        promise.resolve(nil)
      }
    }

    Function("getPlaybackState") { () -> String in
      // ApplicationMusicPlayer.shared.state is @MainActor; we're already on
      // the main thread because Expo Functions run there by default.
      let s = ApplicationMusicPlayer.shared.state.playbackStatus
      switch s {
      case .stopped: return "stopped"
      case .playing: return "playing"
      case .paused: return "paused"
      case .interrupted: return "interrupted"
      case .seekingForward: return "seekingForward"
      case .seekingBackward: return "seekingBackward"
      @unknown default: return "stopped"
      }
    }
  }

  private static func statusString(_ status: MusicAuthorization.Status) -> String {
    switch status {
    case .notDetermined: return "notDetermined"
    case .denied: return "denied"
    case .restricted: return "restricted"
    case .authorized: return "authorized"
    @unknown default: return "notDetermined"
    }
  }
}
