import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';
import { getStyles } from './styles';

export interface FeedbackBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  type: 'success' | 'error' | 'confirm';
  title: string;
  description?: string;
  showActionButton?: boolean;
  onAction?: () => void;
  actionButtonText?: string;
  cancelButtonText?: string;
  onCancelAction?: () => void;
}

export default function FeedbackBottomSheet({
  visible,
  onClose,
  type,
  title,
  description,
  showActionButton = false,
  onAction,
  actionButtonText,
  cancelButtonText,
  onCancelAction,
}: FeedbackBottomSheetProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const insets = useSafeAreaInsets();

  const isSuccess = type === 'success';
  const isConfirm = type === 'confirm';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.bottomSheetContainer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
              {/* Header with Close Button */}
              <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeIconText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Content */}
              <View style={styles.contentContainer}>
                {/* Icon */}
                <View
                  style={[
                    styles.iconContainer,
                    isSuccess ? styles.iconSuccess : (isConfirm ? styles.iconConfirm : styles.iconError),
                  ]}
                >
                  <Text style={styles.iconText}>{isSuccess ? '✓' : (isConfirm ? '?' : '✕')}</Text>
                </View>

                {/* Title */}
                <Text style={styles.title}>{title}</Text>

                {/* Description (Optional) */}
                {description ? (
                  <Text style={styles.description}>{description}</Text>
                ) : null}

                {/* Action Button (Optional) */}
                {showActionButton && (
                  isConfirm ? (
                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.buttonRowItem, styles.buttonCancel]}
                        onPress={onCancelAction || onClose}
                      >
                        <Text style={[styles.actionButtonText, styles.textCancel]}>
                          {cancelButtonText || 'Cancel'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.buttonRowItem, styles.buttonConfirm]}
                        onPress={onAction || onClose}
                      >
                        <Text style={styles.actionButtonText}>
                          {actionButtonText || 'Confirm'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        isSuccess ? styles.buttonSuccess : styles.buttonError,
                      ]}
                      onPress={onAction || onClose}
                    >
                      <Text style={styles.actionButtonText}>
                        {actionButtonText || (isSuccess ? 'Done' : 'Cancel')}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
