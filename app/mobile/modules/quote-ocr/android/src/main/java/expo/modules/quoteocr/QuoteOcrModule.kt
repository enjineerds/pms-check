package expo.modules.quoteocr

import android.net.Uri
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.TextRecognizer
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class QuoteOcrModule : Module() {
  private var client: TextRecognizer? = null
  private val recognizer: TextRecognizer
    get() = client ?: TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS).also { client = it }

  override fun definition() = ModuleDefinition {
    Name("QuoteOcr")

    OnDestroy { client?.close() }

    AsyncFunction("recognize") { uri: Uri, promise: Promise ->
      val context = appContext.reactContext ?: return@AsyncFunction promise.reject(Exceptions.ReactContextLost())
      val image = try {
        InputImage.fromFilePath(context, uri)
      } catch (e: Exception) {
        return@AsyncFunction promise.reject(CodedException("E_IMAGE", "Can't read image at $uri", e))
      }
      val upright = image.rotationDegrees % 180 == 0
      val width = if (upright) image.width else image.height
      val height = if (upright) image.height else image.width
      recognizer.process(image)
        .addOnSuccessListener { text ->
          val lines = text.textBlocks.flatMap { it.lines }.mapNotNull { line ->
            val b = line.boundingBox ?: return@mapNotNull null
            mapOf(
              "text" to line.text,
              "confidence" to line.confidence.toDouble(),
              "box" to mapOf(
                "x" to b.left.toDouble() / width,
                "y" to b.top.toDouble() / height,
                "width" to b.width().toDouble() / width,
                "height" to b.height().toDouble() / height,
              ),
            )
          }
          promise.resolve(mapOf("engine" to "mlkit", "width" to width, "height" to height, "lines" to lines))
        }
        .addOnFailureListener { promise.reject(CodedException("E_RECOGNIZE", it.localizedMessage, it)) }
    }
  }
}
