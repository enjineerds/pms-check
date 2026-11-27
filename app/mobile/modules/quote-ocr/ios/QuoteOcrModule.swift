import ExpoModulesCore
import Vision

public class QuoteOcrModule: Module {
  public func definition() -> ModuleDefinition {
    Name("QuoteOcr")

    AsyncFunction("recognize") { (url: URL, promise: Promise) in
      guard let image = UIImage(contentsOfFile: url.path), let cgImage = image.cgImage else {
        return promise.reject("E_IMAGE", "Can't read image at \(url.path)")
      }
      let request = VNRecognizeTextRequest { request, error in
        if let error = error { return promise.reject("E_RECOGNIZE", error.localizedDescription) }
        let observations = (request.results as? [VNRecognizedTextObservation]) ?? []
        let lines: [[String: Any]] = observations.compactMap { o in
          guard let top = o.topCandidates(1).first else { return nil }
          let b = o.boundingBox
          // Vision's origin is bottom-left; the app's boxes are top-left.
          return [
            "text": top.string,
            "confidence": top.confidence,
            "box": ["x": b.minX, "y": 1 - b.maxY, "width": b.width, "height": b.height],
          ]
        }
        // UIImage.size is already rotated by the EXIF orientation; cgImage's size is not.
        promise.resolve([
          "engine": "vision",
          "width": Int(image.size.width * image.scale),
          "height": Int(image.size.height * image.scale),
          "lines": lines,
        ])
      }
      request.recognitionLevel = .accurate
      // The spike measured this on: it reads more lines and makes low confidence mean a wrong price.
      request.usesLanguageCorrection = true
      DispatchQueue.global(qos: .userInitiated).async {
        do {
          try VNImageRequestHandler(cgImage: cgImage, orientation: Self.orientation(image), options: [:]).perform([request])
        } catch {
          promise.reject("E_RECOGNIZE", error.localizedDescription)
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
