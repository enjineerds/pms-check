import ExpoModulesCore
import Vision

public class VisionOcrModule: Module {
  public func definition() -> ModuleDefinition {
    Name("VisionOcr")

    AsyncFunction("recognize") { (url: URL, languageCorrection: Bool, promise: Promise) in
      guard let image = UIImage(contentsOfFile: url.path), let cgImage = image.cgImage else {
        return promise.reject("E_IMAGE", "Can't read image at \(url.path)")
      }
      let request = VNRecognizeTextRequest { request, error in
        if let error = error { return promise.reject("E_VISION", error.localizedDescription) }
        let observations = (request.results as? [VNRecognizedTextObservation]) ?? []
        let lines: [[String: Any]] = observations.compactMap { o in
          guard let top = o.topCandidates(1).first else { return nil }
          let b = o.boundingBox
          // Vision's origin is bottom-left; flip to top-left like every other box in the app.
          return [
            "text": top.string,
            "confidence": top.confidence,
            "box": ["x": b.minX, "y": 1 - b.maxY, "width": b.width, "height": b.height],
          ]
        }
        promise.resolve(["width": cgImage.width, "height": cgImage.height, "lines": lines])
      }
      request.recognitionLevel = .accurate
      request.usesLanguageCorrection = languageCorrection
      DispatchQueue.global(qos: .userInitiated).async {
        do {
          try VNImageRequestHandler(cgImage: cgImage, orientation: Self.orientation(image), options: [:]).perform([request])
        } catch {
          promise.reject("E_VISION", error.localizedDescription)
        }
      }
    }
  }

  private static func orientation(_ image: UIImage) -> CGImagePropertyOrientation {
    switch image.imageOrientation {
    case .down: return .down
    case .left: return .left
    case .right: return .right
    case .upMirrored: return .upMirrored
    case .downMirrored: return .downMirrored
    case .leftMirrored: return .leftMirrored
    case .rightMirrored: return .rightMirrored
    default: return .up
    }
  }
}
